import { Color, Vector3, Box3 } from "three";
import { derived, get, writable, Writable } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { keyShift, keySpace } from "~/input/store";
import { exportRelm, importRelm } from "./Export";

import { worldUIMode } from "~/stores/worldUIMode";
import { deltaTime, fpsTime } from "~/stores/stats";
import { playState, PlayState } from "~/stores/playState";
import { copyBuffer, CopyBuffer } from "~/stores/copyBuffer";
import { shadowsEnabled } from "~/stores/shadowsEnabled";

import { makeLight } from "~/prefab/makeLight";

import { Entity } from "~/ecs/base";
import { Collider, ColliderVisible } from "~/ecs/plugins/physics";
import { NonInteractive } from "~/ecs/plugins/non-interactive";
import { BoundingHelper } from "~/ecs/plugins/bounding-helper";
import { ControllerState } from "~/ecs/plugins/player-control";
import { WAVING } from "~/ecs/plugins/player-control/constants";

import { SelectionManager } from "./SelectionManager";
import { ChatManager } from "./ChatManager";
import { CameraManager } from "./CameraManager";

import { GROUND_INTERACTION } from "~/config/colliderInteractions";

import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import type { PageParams } from "~/types";
import type { Dispatch, State as RelmState } from "~/main/ProgramTypes";
import { AVConnection } from "~/av";
import { playerId } from "~/identity/playerId";
import { Avatar } from "~/identity/Avatar";
import { Participant } from "~/identity/types";
import { ParticipantManager } from "~/identity/ParticipantManager";
import { ParticipantYBroker } from "~/identity/ParticipantYBroker";

export class WorldManager {
  dispatch: Dispatch;
  // state: RelmState;

  world: DecoratedECSWorld;
  worldDoc: WorldDoc;
  subrelm: string;
  entryway: string;
  relmDocId: string;
  avConnection: AVConnection;

  me: Participant;

  light: Entity;
  connectOpts;

  participants: ParticipantManager;
  selection: SelectionManager;
  chat: ChatManager;
  camera: CameraManager;

  previousLoopTime: number = 0;
  started: boolean = false;

  unsubs: Function[] = [];

  async init(
    dispatch: Dispatch,
    broker: ParticipantYBroker,
    ecsWorld: DecoratedECSWorld,
    worldDoc: WorldDoc,
    pageParams: PageParams,
    relmDocId: string,
    avConnection: AVConnection,
    participants: Map<string, Participant>
  ) {
    this.dispatch = dispatch;

    this.world = ecsWorld;
    this.worldDoc = worldDoc;
    this.subrelm = pageParams.relmName;
    this.entryway = pageParams.entryway;
    this.relmDocId = relmDocId;
    this.avConnection = avConnection;

    this.unsubs.push(
      this.worldDoc.settings.subscribe(($settings) => {
        const fog = this.world.presentation.scene.fog;
        if ($settings.get("fogColor")) {
          fog.color = new Color($settings.get("fogColor"));
        }
        if (typeof $settings.get("fogDensity") == 'number') {
          fog.density = $settings.get("fogDensity");
        }
      })
    );

    this.selection = new SelectionManager(this.worldDoc);

    this.participants = new ParticipantManager(dispatch, broker, participants);

    // this.chat = new ChatManager(this.identities);
    // this.chat.setMessages(this.worldDoc.messages);

    this.camera = new CameraManager(
      this.world,
      this.participants.local.avatar.entities.body
    );

    const token = new URL(window.location.href).searchParams.get("t");

    this.world.perspective.setAvatar(this.avatar.entities.body);
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
        const state = this.avatar.entities.body.get(ControllerState);
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

    this.start();
  }

  async deinit() {
    this.started = false;

    this.unsubs.forEach((f) => f());
    this.unsubs.length = 0;

    this.worldDoc.unsubscribe();
    this.worldDoc.disconnect();
    this.world.reset();
    this.scene.traverse((node) => {
      if (node.removeFromParent) node.removeFromParent();
    });

    // this.participants.deinit();
    this.camera.deinit();
  }

  // TODO: restore JWT override of name, make it uneditable
  //   // set name from server, if available (overrides localstorage)
  //   if (connectOpts.username) {
  //     this.identities.me.set({ name: connectOpts.username });
  //     this.identities.me.avatar.editableName = false;
  //   }

  populate() {
    if (!this.world) {
      throw new Error(`Can't populate when world is null`);
    }
    if (!this.avatar.entities.body) {
      throw new Error(`Can't populate when avatar entity is null`);
    }

    const light = makeLight(this.world, this.avatar.entities.body).activate();
    this.light = light;
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
    if (get(playState) === "playing" || !this.started) {
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
    if (this.participants.local.identityData.status === "present")
      this.participants.sendMyTransformData();
    this.camera.update(time);

    this.previousLoopTime = time;
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

  moveTo(position: Vector3) {
    const transform = this.participants.local.avatar.transform;
    transform.position.copy(position);
    transform.modified(); // update physics engine
    this.camera.moveTo(position);
  }

  /**
   * Convenience Accessors
   */

  get participantId() {
    return playerId;
  }

  get avatar(): Avatar {
    return this.participants.local.avatar;
  }

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

  get boundingBox(): Box3 {
    const box = new Box3();
    box.setFromObject(this.scene);
    return box;
  }
}
