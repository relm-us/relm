import { get, Writable } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { deltaTime, fpsTime } from "~/stores/stats";
import { worldState, WorldState } from "~/stores/worldState";
import { scale } from "~/stores/viewport";
import { globalEvents } from "~/events";

import {
  makeAvatarAndActivate,
  makeStageAndActivate,
  makeGround,
} from "~/prefab";
import { World } from "~/ecs/base";
import { Follow } from "~/ecs/plugins/follow";
import { HeadController } from "~/ecs/plugins/player-control";
import { SelectionManager } from "./SelectionManager";
import { LoadingState } from "./LoadingState";
import { ConnectOptions } from "~/stores/connection";
import { Collider } from "~/ecs/plugins/rapier";

export default class WorldManager {
  world: World & { physics: any; presentation: any; cssPresentation: any };
  viewport: HTMLElement;
  loading: LoadingState;
  state: Writable<WorldState>;
  avatar;
  camera;
  connection;

  wdoc: WorldDoc;
  selection: SelectionManager;

  previousLoopTime: number = 0;

  constructor({ world, viewport }) {
    if (!world) throw new Error(`world is required`);
    if (!viewport) throw new Error(`viewport is required`);
    this.world = world;
    this.viewport = viewport;
    this.loading = new LoadingState();
    this.state = worldState;

    this.wdoc = new WorldDoc("relm", world);

    this.selection = new SelectionManager(this.wdoc);

    this.mount();
    this.populate();

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

  mount() {
    const world = this.world;

    // CSS3D elements go "behind" the WebGL canvas
    world.cssPresentation.setViewport(this.viewport);
    world.cssPresentation.renderer.domElement.style.zIndex = 0;

    // WebGL canvas goes "on top" of CSS3D HTML elements
    world.presentation.setViewport(this.viewport);
    world.presentation.renderer.domElement.style.zIndex = 1;
  }

  unmount() {
    const world = this.world;

    world.cssPresentation.setViewport(null);
    world.presentation.setViewport(null);
  }

  connect(connection: ConnectOptions) {
    this.connection = connection;

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

    this.wdoc.connect(this.connection, handleLoading.bind(this));
  }

  disconnect() {
    this.wdoc.disconnect();
  }

  reset() {
    this.disconnect();
    this.unmount();
    this.world.reset();
  }

  populate() {
    if (!this.world) {
      throw new Error(`Can't populate when world is null`);
    }

    // For now, we'll show a demo scene
    this.avatar = makeAvatarAndActivate(this.world);
    const { camera } = makeStageAndActivate(this.world, this.avatar);
    this.camera = camera;

    makeGround(this.world).activate();
  }

  depopulate() {
    this.world.reset();
  }

  disablePhysics() {
    const collider = this.avatar.components.get(Collider);
    collider.interaction = 0x00020001; // interact only with ground
    collider.modified();
  }

  enablePhysics() {
    const collider = this.avatar.components.get(Collider);
    collider.interaction = 0x00010001; // interact with normal things
    collider.modified();
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
    // Export everything as a JSON document
    return this.wdoc.toJSON();
  }

  fromJSON(json) {
    this.selection.clear();
    let entityIds = [];
    try {
      // Import everything in the JSON document
      entityIds = this.wdoc.fromJSON(json);
    } catch (err) {
      console.warn(err);
      return false;
    }

    // Select everything that was just imported
    setTimeout(() => {
      entityIds.forEach((id) => {
        this.selection.addEntityId(id);
      });
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
