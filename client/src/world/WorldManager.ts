import { Vector3, DirectionalLight } from "three";
import { get, Writable } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { globalEvents } from "~/events";
import { exportRelm, importRelm } from "./Export";

import { deltaTime, fpsTime } from "~/stores/stats";
import { worldState, WorldState } from "~/stores/worldState";
import { ConnectOptions } from "~/stores/connection";
import { scale } from "~/stores/viewport";
import { shadowsEnabled } from "~/stores/settings";
import { entryway } from "~/stores/subrelm";

import { makeStageAndActivate, makeInitialCollider } from "~/prefab";
import { Entity, World } from "~/ecs/base";
import { Follow } from "~/ecs/plugins/follow";
import { HeadController } from "~/ecs/plugins/player-control";
import { Collider } from "~/ecs/plugins/rapier";
import { Transform } from "~/ecs/plugins/core";

import { SelectionManager } from "./SelectionManager";
import { LoadingState } from "./LoadingState";
import { IdentityManager } from "~/identity/IdentityManager";
import { ChatManager } from "./ChatManager";
import {
  AVATAR_BUILDER_INTERACTION,
  AVATAR_INTERACTION,
} from "~/config/colliderInteractions";

import { avPermission } from "~/stores/avPermission";
import RoomClient from "~/av/RoomClient";
import { browser } from "~/av/browserInfo";

export default class WorldManager {
  world: World & {
    physics: any;
    presentation: any;
    cssPresentation: any;
    htmlPresentation: any;
  };
  viewport: HTMLElement;
  loading: LoadingState;
  state: Writable<WorldState>;
  camera: Entity;
  light: Entity;
  connectOpts;

  wdoc: WorldDoc;
  selection: SelectionManager;
  identities: IdentityManager;
  chat: ChatManager;

  roomClient: any;

  previousLoopTime: number = 0;
  sendLocalStateInterval: any; // Timeout

  constructor({ world, viewport }) {
    if (!world) throw new Error(`world is required`);
    if (!viewport) throw new Error(`viewport is required`);
    this.world = world;
    this.viewport = viewport;
    this.state = worldState;
    this.loading = new LoadingState();

    this.wdoc = new WorldDoc(world);

    this.selection = new SelectionManager(this.wdoc);
    this.identities = new IdentityManager(this);
    this.chat = new ChatManager(this.identities, this.wdoc.messages);

    this.mount();
    this.populate();

    // Move avatar to named entryway once world has loaded
    this.wdoc.on("sync", () => {
      entryway.subscribe(($entryway) => {
        this.enter($entryway);
      });
    });

    shadowsEnabled.subscribe(($enabled) => {
      const ref = this.light.getByName("DirectionalLightRef");
      if (!ref) return;
      const light: DirectionalLight = ref.value;
      light.castShadow = $enabled;
    });

    worldState.subscribe(($state) => {
      switch ($state) {
        case "running":
          this.world.presentation.setLoop(this.loop.bind(this));
          break;
        case "paused":
          this.world.presentation.setLoop(null);
          break;
      }
    });

    scale.subscribe(($scale) => {
      if (!this.camera) return;

      const follow = this.camera.get(Follow);
      if (!follow) return;

      const distance = 5 + (20 * $scale) / 100;
      follow.offset.set(0, distance, distance);
    });

    globalEvents.on("mouseActivity", () => {
      if (this.avatar) {
        const head = this.avatar.getChildren()[0];
        const controller = head.get(HeadController);
        if (controller) controller.enabled = true;
      }
    });
  }

  enter(entryway: string) {
    const entryways = this.wdoc.entryways.y.toJSON();
    const coords = new Vector3(0, 0, 0);
    if (entryway in entryways) {
      coords.fromArray(entryways[entryway]);
    }
    this.identities.me.avatar.moveTo(coords);
  }

  mount() {
    const world = this.world;

    // CSS3D elements go "behind" the WebGL canvas
    world.cssPresentation.setViewport(this.viewport);
    world.cssPresentation.renderer.domElement.style.zIndex = 0;

    // WebGL canvas goes "on top" of CSS3D HTML elements
    world.presentation.setViewport(this.viewport);
    world.presentation.renderer.domElement.style.zIndex = 1;

    // HTML2D elements go "above" the WebGL canvas
    world.htmlPresentation.setViewport(this.viewport);
    world.htmlPresentation.domElement.style.zIndex = 2;
  }

  unmount() {
    const world = this.world;

    world.cssPresentation.setViewport(null);
    world.presentation.setViewport(null);
  }

  connectAV(roomId, displayName) {
    if (this.roomClient) return;

    this.roomClient = new RoomClient({
      roomId,
      displayName: displayName || get(this.identities.me.sharedFields).name,
      peerId: this.identities.me.playerId,
      device: browser,
      // handlerName: handler,
      // useSimulcast,
      // useSharingSimulcast,
      // forceTcp,
      produce: true,
      consume: true,
      // forceH264,
      // forceVP9,
      // svc,
      // datachannel,
      // externalVideo,
    });

    this.roomClient.join();
  }

  connect(connectOpts: ConnectOptions) {
    this.connectOpts = connectOpts;

    // set name from server, if available (overrides localstorage)
    if (connectOpts.username) {
      this.identities.me.setName(connectOpts.username);
      this.identities.me.avatar.disableEditingLabel();
    }

    avPermission.subscribe(($permission) => {
      if ($permission.done) {
        console.log("connecting av to", connectOpts);
        this.connectAV(connectOpts.room, connectOpts.username);
      }
    });

    // Init loading
    let assetsLoaded = 0;
    let assetsTotal = this.loading.getMaximum() / 2;
    let metadataLoaded = 0;
    let metadataTotal = this.loading.getMaximum() / 2;
    this.loading.setStateOnce("init");

    const handleLoading = (state) => {
      if (state === "loading") {
        this.loading.setStateOnce("loading-metadata");
        // fake progress, because we can't see inside websocket data transfer rate
        if (metadataLoaded < metadataTotal) {
          metadataLoaded++;
        }
        this.loading.setProgress(assetsLoaded + metadataLoaded);
        // Continue
        this.worldStep();
      } else if (state === "loaded") {
        metadataLoaded = metadataTotal;
        this.loading.setProgress(assetsLoaded + metadataLoaded);

        this.loading.setStateOnce("loading-assets");

        let waitCycle = 500; // 10 seconds max
        const progress = () => {
          this.worldStep();

          const remaining = this.countAssetsLoading();
          if (remaining > assetsTotal) {
            assetsTotal = remaining;
          }
          assetsLoaded = assetsTotal - remaining;
          this.loading.setProgress(assetsLoaded + metadataLoaded);

          if (remaining === 0 || waitCycle === 0) {
            this.loading.setProgress(assetsTotal + metadataTotal);
            setTimeout(() => {
              this.loading.state.set("done");
              // optimization: send textures to GPU
              this.world.presentation.compile();
              this.start();
            }, 50);
          } else {
            waitCycle--;
            setTimeout(progress, 50);
          }
        };
        progress();
      }
    };

    this.wdoc.connect(this.connectOpts, handleLoading.bind(this));

    this.sendLocalStateInterval = setInterval(() => {
      const data = this.identities.me.avatar.getTransformData();
      this.setLocalStateField("m", data);
    }, 20);

    this.wdoc.provider.awareness.on("change", (changes) => {
      for (let id of changes.removed) {
        this.identities.removeByClientId(id);
      }

      const states = this.wdoc.provider.awareness.getStates();

      states.forEach(({ m }, clientId) => {
        // Ignore updates that don't include matrix transform data
        if (!m) return;

        // Ignore updates about ourselves
        if (clientId === this.wdoc.ydoc.clientID) return;

        this.identities.setTransformData(clientId, m);
      });
    });
  }

  disconnect() {
    clearInterval(this.sendLocalStateInterval);
    this.sendLocalStateInterval = undefined;
    this.wdoc.disconnect();
  }

  reset() {
    this.disconnect();
    this.unmount();
    this.world.reset();
  }

  setLocalStateField(field, state) {
    if (this.wdoc.provider) {
      this.wdoc.provider.awareness.setLocalStateField(field, state);
    }
  }

  get avatar(): Entity {
    return this.identities.me.avatar.entity;
  }

  populate() {
    if (!this.world) {
      throw new Error(`Can't populate when world is null`);
    }

    // TODO: this.avatar = ?

    this.world.presentation.setCameraTarget(
      this.avatar.get(Transform).position
    );
    const { camera, light } = makeStageAndActivate(this.world, this.avatar);
    this.camera = camera;
    this.light = light;

    makeInitialCollider(this.world).activate();
  }

  depopulate() {
    this.world.reset();
  }

  enableAvatarPhysics(enabled = true) {
    this.avatar.traverse((entity) => {
      const collider = entity.components.get(Collider);
      if (!collider) return;

      // prettier-ignore
      (collider as any).interaction =
        enabled ? AVATAR_INTERACTION: // interact with normal things
                  AVATAR_BUILDER_INTERACTION ; // interact only with ground

      collider.modified();
    });
  }

  // Make the avatar translucent or opaque
  ghost(enabled = true, opacity = 0.5) {
    const entities = [this.avatar, ...this.avatar.subgroup];

    for (const entity of entities) {
      const parent = entity.getByName("Object3D").value;

      parent.traverse((child) => {
        if (child.isMesh) {
          if (enabled) {
            child.userData.ghost = { opacity: child.material.opacity };
          }

          child.material.transparent = enabled;
          child.material.opacity = enabled
            ? opacity
            : child.userData.ghost.opacity;

          if (!enabled) {
            delete child.userData.ghost;
          }
        }
      });
    }
  }

  countAssetsLoading() {
    let count = 0;
    this.world.entities.entities.forEach((e) => {
      if (e.getByName("ImageLoader") || e.getByName("ModelLoading")) count++;
    });
    return count;
  }

  start() {
    worldState.set("running");
  }

  stop() {
    worldState.set("paused");
  }

  step() {
    if (get(worldState) === "running") {
      this.stop();
    }
    requestAnimationFrame(this.loop.bind(this));
  }

  worldStep(delta?: number) {
    if (this.world) {
      const isRunning = get(worldState) === "running";
      this.world.update(isRunning && delta !== undefined ? delta : 1000 / 60);
    }
  }

  loop(time: number) {
    const delta = time - this.previousLoopTime;
    deltaTime.addData(delta);
    fpsTime.addData(1000 / delta);

    this.worldStep(delta);

    this.previousLoopTime = time;
  }

  toJSON() {
    return exportRelm(this.wdoc);
  }

  fromJSON(json) {
    this.selection.clear();
    let entityIds = [];
    try {
      // Import everything in the JSON document
      entityIds = importRelm(this.wdoc, json);
    } catch (err) {
      console.warn(err);
      return false;
    }

    // Select everything that was just imported
    setTimeout(() => {
      this.selection.addEntityIds(entityIds);
    }, 200);
    return true;
  }

  /**
   * Convenience Accessors
   */

  get scene() {
    return this.world.presentation.scene;
  }
}
