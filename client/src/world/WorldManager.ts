import { Vector3, Color } from "three";
import { derived, get } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { keyShift, keySpace } from "~/input/store";
import { exportRelm, importRelm } from "./Export";
import { mediaDesired } from "video-mirror";

import { mode } from "~/stores/mode";
import { deltaTime, fpsTime } from "~/stores/stats";
import { worldState, WorldState } from "~/stores/worldState";
import { playState, PlayState } from "~/stores/playState";
import { copyBuffer, CopyBuffer } from "~/stores/copyBuffer";
import { ConnectOptions } from "~/stores/connection";
import { shadowsEnabled } from "~/stores/settings";
import { entryway } from "~/stores/subrelm";
import {
  loadingState,
  resetLoading,
  startPollingLoadingState,
} from "~/stores/loading";

import { makeInitialCollider } from "~/prefab";
import { makeLight } from "~/prefab/makeLight";

import { Entity } from "~/ecs/base";
import { Collider, ColliderVisible } from "~/ecs/plugins/physics";
import { NonInteractive } from "~/ecs/plugins/non-interactive";
import { BoundingHelper } from "~/ecs/plugins/bounding-helper";
import { ControllerState } from "~/ecs/plugins/player-control";
import { WAVING } from "~/ecs/plugins/player-control/constants";

import { SelectionManager } from "./SelectionManager";
import { IdentityManager } from "~/identity/IdentityManager";
import { ChatManager } from "./ChatManager";
import { CameraManager } from "./CameraManager";
import { Avatar } from "~/identity/Avatar";

import { GROUND_INTERACTION } from "~/config/colliderInteractions";

import { setupState } from "~/stores/setupState";

import type { DecoratedWorld } from "~/types/DecoratedWorld";
import { AVConnection } from "~/av";

export default class WorldManager {
  world: DecoratedWorld;
  viewport: HTMLElement;
  light: Entity;
  connectOpts;

  wdoc: WorldDoc;
  selection: SelectionManager;
  identities: IdentityManager;
  chat: ChatManager;
  camera: CameraManager;

  avConnection: AVConnection;

  previousLoopTime: number = 0;
  sendLocalStateInterval: any; // Timeout
  started: boolean = false;

  constructor({ world, viewport }) {
    if (!world) throw new Error(`world is required`);
    if (!viewport) throw new Error(`viewport is required`);
    this.world = world;
    this.viewport = viewport;

    this.wdoc = new WorldDoc(world);

    this.selection = new SelectionManager(this.wdoc);
    this.identities = new IdentityManager(this);
    this.chat = new ChatManager(this.identities, this.wdoc.messages);
    this.camera = new CameraManager(this, this.identities.me.avatar.entity);
    this.avConnection = new AVConnection(this.identities.me.playerId);

    this.mount();
    this.populate();

    this.camera.init();

    this.wdoc.settings.subscribe(($settings) => {
      console.log("$settings", $settings);

      const fog = this.world.presentation.scene.fog;
      if ($settings.get("fogColor")) {
        fog.color = new Color($settings.get("fogColor"));
      }
      if ($settings.get("fogDensity")) {
        fog.density = $settings.get("fogDensity");
      }
    });

    shadowsEnabled.subscribe(($enabled) => {
      console.log("shadows enabled", $enabled);
      this.world.presentation.renderer.shadowMap.enabled = $enabled;
      const spec = this.light.getByName("DirectionalLight");
      spec.shadow = $enabled;
      spec.modified();
    });

    // Make colliders visible in build mode
    mode.subscribe(($mode) => {
      const enabled = $mode === "build";
      this.avatar.enableCanFly(enabled);
      this.avatar.enableNonInteractive(enabled);
      this.enableNonInteractiveGround(enabled);
      this.enableCollidersVisible(enabled);
    });

    /**
     * Start when both loading is done and audio/video screen is complete
     */
    derived([loadingState, setupState], ([$loadingState, $setupState], set) => {
      set($loadingState === "loaded" && $setupState === "done");
    }).subscribe((ready) => {
      if (ready) this.start();
    });

    derived([mode, keyShift], ([$mode, $keyShift], set) => {
      if ($mode === "build" && $keyShift) {
        set(true);
      } else {
        set(false);
      }
    }).subscribe((buildModeShift: boolean) => {
      this.enableNonInteractiveGround(!buildModeShift);
      this.enableBoundingVisible(buildModeShift);
    });

    // Temporary hack: spacebar makes avatar wave
    derived([mode, keySpace], ([$mode, $keySpace], set) => {
      if ($mode === "play" && $keySpace) {
        set(true);
      } else {
        set(false);
      }
    }).subscribe((wave: boolean) => {
      const state = this.avatar.entity.get(ControllerState);
      if (!state) return;
      state.animOverride = wave ? WAVING : null;
    });

    playState.subscribe(($state) => {
      switch ($state) {
        case "playing":
          this.world.presentation.setLoop(this.loop.bind(this));
          break;
        case "paused":
          this.world.presentation.setLoop(null);
          // TODO: Make it so window resize events "step" a frame
          break;
      }
    });
  }

  enter(entryway: string) {
    const entryways = this.wdoc.entryways.y.toJSON();
    const position = new Vector3(0, 0, 0);
    if (entryway in entryways) {
      position.fromArray(entryways[entryway]);
    }
    this.avatar.moveTo(position);
  }

  mount() {
    const world = this.world;

    world.perspective.setAvatar(this.avatar.entity);

    // CSS3D elements go "behind" the WebGL canvas
    world.cssPresentation.setViewport(this.viewport);
    world.cssPresentation.renderer.domElement.style.zIndex = "0";

    // WebGL canvas goes "on top" of CSS3D HTML elements
    world.presentation.setViewport(this.viewport);
    world.presentation.renderer.domElement.style.zIndex = "1";

    // HTML2D elements go "above" the WebGL canvas
    world.htmlPresentation.setViewport(this.viewport);
    world.htmlPresentation.domElement.style.zIndex = "2";
  }

  unmount() {
    const world = this.world;

    world.cssPresentation.setViewport(null);
    world.presentation.setViewport(null);
  }

  connect(connectOpts: ConnectOptions) {
    this.connectOpts = connectOpts;

    // set name from server, if available (overrides localstorage)
    if (connectOpts.username) {
      this.identities.me.set({ name: connectOpts.username });
      this.identities.me.avatar.editableName = false;
    }

    derived(
      [setupState, mediaDesired],
      ([$setupState, $mediaDesired]: any[], set) => {
        set({
          ready: $setupState === "done",
          audio: $mediaDesired.audio,
          video: $mediaDesired.video,
        });
      }
    ).subscribe(async ({ ready, audio, video }) => {
      if (ready) {
        await this.avConnection.connect({
          roomId: connectOpts.room,
          token: connectOpts.twilio,
          displayName: connectOpts.username || this.identities.me.get("name"),
          produceAudio: audio,
          produceVideo: video,
        });
      }
    });

    // Poll for loading state info such as entities and assets loaded
    loadingState.set("loading");
    startPollingLoadingState(this.wdoc, () => {
      loadingState.set("loaded");
    });

    // Connect & show loading progress
    resetLoading(connectOpts.assetsCount, connectOpts.entitiesCount);
    this.wdoc.connect(this.connectOpts);

    this.wdoc.provider.awareness.on("change", (changes) => {
      for (let id of changes.removed) {
        this.identities.removeByClientId(id);
      }
    });

    this.wdoc.provider.awareness.on("update", () => {
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

  get avatar(): Avatar {
    return this.identities.me.avatar;
  }

  populate() {
    if (!this.world) {
      throw new Error(`Can't populate when world is null`);
    }
    if (!this.avatar.entity) {
      throw new Error(`Can't populate when avatar entity is null`);
    }

    const light = makeLight(this.world, this.avatar.entity).activate();
    this.light = light;

    makeInitialCollider(this.world).activate();
  }

  depopulate() {
    this.world.reset();
  }

  enableNonInteractiveGround(enabled = true) {
    const action = enabled ? "add" : "maybeRemove";
    const entities = this.world.entities.getAllByComponent(Collider);
    for (const entity of entities) {
      const collider = entity.get(Collider);
      if (collider.interaction === GROUND_INTERACTION) {
        entity[action](NonInteractive);
      }
    }
  }

  enableCollidersVisible(enabled = true) {
    const action = enabled ? "add" : "maybeRemove";
    const entities = this.world.entities.getAllByComponent(Collider);
    for (const entity of entities) {
      const interactive = !entity.get(NonInteractive);
      if (interactive) entity[action](ColliderVisible);
    }
  }

  enableBoundingVisible(enabled = true) {
    const action = enabled ? "add" : "maybeRemove";
    const entities = this.world.entities.getAllBy((entity) => !entity.parent);
    for (const entity of entities) {
      entity[action](BoundingHelper);
    }
  }

  start() {
    if (this.started) {
      playState.set("playing");
    } else {
      // Signal to all participants we are "present" and our avatar can be shown
      this.identities.me.set({ status: "present" });

      // Pre-compile assets to prevent some jank while exploring the world
      this.world.presentation.compile();

      // Move avatar to named entryway once world has loaded
      entryway.subscribe(($entryway) => {
        this.enter($entryway);
      });

      worldState.set("running");
      playState.set("playing");

      this.started = true;
    }
  }

  stop() {
    playState.set("paused");
  }

  step() {
    if (get(playState) === "playing") {
      this.stop();
    }
    requestAnimationFrame(this.loop.bind(this));
  }

  worldStep(delta?: number) {
    if (this.world) {
      const isRunning = get(playState) === "playing";
      this.world.update(isRunning && delta !== undefined ? delta : 1000 / 60);
    }
  }

  loop(time: number) {
    const delta = time - this.previousLoopTime;
    deltaTime.addData(delta);
    fpsTime.addData(1000 / delta);

    this.worldStep(delta);
    this.identities.sync();
    this.sendTransformData();
    this.camera.update(time);

    this.previousLoopTime = time;
  }

  sendTransformData() {
    const data = this.identities.getTransformData();
    if (data) this.wdoc.provider?.awareness.setLocalStateField("m", data);
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

  get worldState(): WorldState {
    return get(worldState);
  }

  set worldState(state: WorldState) {
    const possibilities = ["loading", "running", "error"];
    if (!possibilities.includes(state)) {
      console.error("state must be one of", possibilities);
    } else {
      worldState.set(state);
    }
  }

  get playState(): PlayState {
    return get(playState);
  }

  set playState(state: PlayState) {
    const possibilities = ["playing", "paused"];
    if (!possibilities.includes(state)) {
      console.error("state must be one of", possibilities);
    } else {
      playState.set(state);
    }
  }

  get copyBuffer(): CopyBuffer {
    return get(copyBuffer);
  }
}
