import { Color } from "three";
import { derived, get, writable, Writable } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { keyShift, keySpace } from "~/input/store";
import { exportRelm, importRelm } from "./Export";

import { worldUIMode } from "~/stores/worldUIMode";
import { deltaTime, fpsTime } from "~/stores/stats";
import { playState, PlayState } from "~/stores/playState";
import { copyBuffer, CopyBuffer } from "~/stores/copyBuffer";
import { shadowsEnabled } from "~/stores/shadowsEnabled";

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

import { RelmRestAPI } from "~/identity/RelmRestAPI";

import { GROUND_INTERACTION } from "~/config/colliderInteractions";
import { config } from "~/config";

import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import type { Dispatch, RelmState } from "~/main/RelmStateAndMessage";
import { AVConnection } from "~/av";
import { Identity } from "~/identity/Identity";
import { playerId } from "~/identity/playerId";

export class WorldManager {
  dispatch: Dispatch;
  state: RelmState;

  world: DecoratedECSWorld;
  worldDoc: WorldDoc;
  subrelm: string;
  entryway: string;

  light: Entity;
  connectOpts;

  selection: SelectionManager;
  identities: IdentityManager = new IdentityManager();
  meStore: Writable<Identity> = writable(null);
  chat: ChatManager;
  chatStore: Writable<ChatManager> = writable(null);
  camera: CameraManager;

  avConnection: AVConnection;
  api: RelmRestAPI;

  previousLoopTime: number = 0;
  started: boolean = false;

  unsubs: Function[] = [];

  get participantId() {
    return playerId;
  }

  async init(dispatch: Dispatch, state: RelmState) {
    this.dispatch = dispatch;
    this.state = state;

    this.world = state.ecsWorld;
    this.worldDoc = state.worldDoc;
    this.subrelm = state.relmName;
    this.entryway = state.entryway;

    this.unsubs.push(
      this.worldDoc.settings.subscribe(($settings) => {
        const fog = this.world.presentation.scene.fog;
        if ($settings.get("fogColor")) {
          fog.color = new Color($settings.get("fogColor"));
        }
        if ($settings.get("fogDensity")) {
          fog.density = $settings.get("fogDensity");
        }
      })
    );

    this.selection = new SelectionManager(this.worldDoc);
    this.identities.init(this.worldDoc.ydoc, this.world);
    // TODO: should we follow this store pattern everywhere?
    this.meStore.set(this.identities.me);
    this.chat = new ChatManager(this.identities);
    this.chat.setMessages(this.worldDoc.messages);
    this.chatStore.set(this.chat);
    this.camera = new CameraManager(
      this.world,
      this.identities.me.avatar.entity
    );
    this.avConnection = new AVConnection(this.identities.me.playerId);

    const token = new URL(window.location.href).searchParams.get("t");
    this.api = new RelmRestAPI(config.serverUrl, { token });

    this.mount();
    this.populate();

    this.camera.init();

    this.unsubs.push(
      shadowsEnabled.subscribe(($enabled) => {
        this.world.presentation.renderer.shadowMap.enabled = $enabled;
        const spec = this.light.getByName("DirectionalLight");
        spec.shadow = $enabled;
        spec.modified();
      })
    );

    // Make colliders visible in build mode
    this.unsubs.push(
      worldUIMode.subscribe(($mode) => {
        const enabled = $mode === "build";
        this.avatar.enableCanFly(enabled);
        this.avatar.enableNonInteractive(enabled);
        this.enableNonInteractiveGround(enabled);
        this.enableCollidersVisible(enabled);
      })
    );

    this.unsubs.push(
      derived([worldUIMode, keyShift], ([$mode, $keyShift], set) => {
        if ($mode === "build" && $keyShift) {
          set(true);
        } else {
          set(false);
        }
      }).subscribe((buildModeShift: boolean) => {
        this.enableNonInteractiveGround(!buildModeShift);
        this.enableBoundingVisible(buildModeShift);
      })
    );

    // Temporary hack: spacebar makes avatar wave
    this.unsubs.push(
      derived([worldUIMode, keySpace], ([$mode, $keySpace], set) => {
        if ($mode === "play" && $keySpace) {
          set(true);
        } else {
          set(false);
        }
      }).subscribe((wave: boolean) => {
        const state = this.avatar.entity.get(ControllerState);
        if (!state) return;
        state.animOverride = wave ? WAVING : null;
      })
    );

    this.unsubs.push(
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
      })
    );

    // Remove participant avatars when they disconnect
    const removeDisconnectedIdentities = (changes) => {
      for (let id of changes.removed) {
        this.identities.removeByClientId(id);
      }
    };
    this.worldDoc.provider.awareness.on("change", removeDisconnectedIdentities);
    this.unsubs.push(() =>
      this.worldDoc.provider.awareness.off(
        "change",
        removeDisconnectedIdentities
      )
    );

    // Update participants' transform data (position, rotation, etc.)
    const updateParticipant = () => {
      const states = this.worldDoc.provider.awareness.getStates();

      states.forEach(({ m }, clientId) => {
        // Ignore updates that don't include matrix transform data
        if (!m) return;

        // Ignore updates about ourselves
        if (clientId === this.worldDoc.ydoc.clientID) return;

        this.identities.setTransformData(clientId, m);
      });
    };
    this.worldDoc.provider.awareness.on("update", updateParticipant);
    this.unsubs.push(() =>
      this.worldDoc.provider.awareness.off("update", updateParticipant)
    );

    const disconnect = await this.avConnection.connect({
      roomId: this.state.relmDocId,
      token: this.state.twilioToken,
      // displayName: connectOpts.username || this.identities.me.get("name"),
      displayName: this.identities.me.get("name"),
      // TODO: take audioDesired, videoDesired as input here?
      produceAudio: true,
      produceVideo: true,
    });
    this.unsubs.push(disconnect);

    this.start();
  }

  mount() {
    this.world.perspective.setAvatar(this.avatar.entity);
  }

  // connect(connectOpts: ConnectOptions) {
  //   this.connectOpts = connectOpts;

  //   // set name from server, if available (overrides localstorage)
  //   if (connectOpts.username) {
  //     this.identities.me.set({ name: connectOpts.username });
  //     this.identities.me.avatar.editableName = false;
  //   }

  //   derived(
  //     [setupState, mediaDesired],
  //     ([$setupState, $mediaDesired]: any[], set) => {
  //       set({
  //         ready: $setupState === "done",
  //         audio: $mediaDesired.audio,
  //         video: $mediaDesired.video,
  //       });
  //     }
  //   ).subscribe(async ({ ready, audio, video }) => {
  //     if (ready) {
  //       await this.avConnection.connect({
  //         roomId: connectOpts.room,
  //         token: connectOpts.twilio,
  //         displayName: connectOpts.username || this.identities.me.get("name"),
  //         produceAudio: audio,
  //         produceVideo: video,
  //       });
  //     }
  //   });

  //   // Poll for loading state info such as entities and assets loaded
  //   loadingState.set("loading");
  //   startPollingLoadingState(this.worldDoc, () => {
  //     loadingState.set("loaded");
  //   });

  //   // Connect & show loading progress
  //   resetLoading(connectOpts.assetsCount, connectOpts.entitiesCount);
  //   this.worldDoc.connect(this.connectOpts);

  //   this.worldDoc.provider.awareness.on("change", (changes) => {
  //     for (let id of changes.removed) {
  //       this.identities.removeByClientId(id);
  //     }
  //   });

  //   this.worldDoc.provider.awareness.on("update", () => {
  //     const states = this.worldDoc.provider.awareness.getStates();

  //     states.forEach(({ m }, clientId) => {
  //       // Ignore updates that don't include matrix transform data
  //       if (!m) return;

  //       // Ignore updates about ourselves
  //       if (clientId === this.worldDoc.ydoc.clientID) return;

  //       this.identities.setTransformData(clientId, m);
  //     });
  //   });
  // }

  reset() {
    this.stop();
    this.unsubscribe();
    this.worldDoc.unsubscribe();
    this.worldDoc.disconnect();
    this.world.reset();
    this.scene.traverse((node) => {
      if (node.removeFromParent) node.removeFromParent();
    });
  }

  unsubscribe() {
    this.unsubs.forEach((f) => f());
    this.unsubs.length = 0;
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
    if (data) this.worldDoc.provider?.awareness.setLocalStateField("m", data);
  }

  toJSON() {
    return exportRelm(this.worldDoc);
  }

  fromJSON(json) {
    this.selection.clear();
    let entityIds = [];
    try {
      // Import everything in the JSON document
      entityIds = importRelm(this.worldDoc, json);
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
