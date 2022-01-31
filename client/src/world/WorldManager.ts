import {
  Color,
  Vector3,
  Box3,
  AmbientLight,
  HemisphereLight,
  DirectionalLight,
} from "three";
import * as THREE from "three";

import { derived, get } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { exportRelm, importRelm } from "./Export";

import { worldUIMode } from "~/stores/worldUIMode";
import { fpsTime } from "~/stores/stats";
import { targetFps } from "~/stores/targetFps";
import { playState } from "~/stores/playState";
import { copyBuffer, CopyBuffer } from "~/stores/copyBuffer";
import { shadowsEnabled } from "~/stores/shadowsEnabled";
import { keyShift, keySpace } from "~/stores/keys";

import { makeLight } from "~/prefab/makeLight";

import { Entity } from "~/ecs/base";
import { Collider, ColliderVisible } from "~/ecs/plugins/physics";
import { NonInteractive } from "~/ecs/plugins/non-interactive";
import { BoundingHelper } from "~/ecs/plugins/bounding-helper";
import { ControllerState } from "~/ecs/plugins/player-control";
import { Follow } from "~/ecs/plugins/follow";
import { intersectionPointWithGround } from "~/ecs/shared/isMakingContactWithGround";
import { WAVING } from "~/ecs/plugins/player-control/constants";

import { SelectionManager } from "./SelectionManager";
import { ChatManager } from "./ChatManager";
import { CameraManager } from "./CameraManager";

import { GROUND_INTERACTION } from "~/config/colliderInteractions";

import type { DecoratedECSWorld, PageParams } from "~/types";
import type { Dispatch, State } from "~/main/ProgramTypes";

import { AVConnection } from "~/av";
import { localShareTrackStore } from "~/av/localVisualTrackStore";
import { localVideoTrack } from "video-mirror";
import { createScreenTrack } from "~/av/twilio/createScreenTrack";

import { playerId } from "~/identity/playerId";
import { Avatar } from "~/identity/Avatar";
import { Participant } from "~/types/identity";
import { ParticipantManager } from "~/identity/ParticipantManager";
import { ParticipantYBroker } from "~/identity/ParticipantYBroker";
import { setTransformArrayOnParticipants } from "~/identity/Avatar/transform";
import { delay } from "~/utils/delay";

type LoopType =
  | { type: "raf" }
  | { type: "interval"; targetFps: number; interval?: NodeJS.Timer };
export class WorldManager {
  dispatch: Dispatch;
  state: State;
  broker: ParticipantYBroker;

  world: DecoratedECSWorld;
  worldDoc: WorldDoc;
  subrelm: string;
  entryway: string;
  relmDocId: string;
  avConnection: AVConnection;

  transformArray: any[];

  loopType: LoopType = { type: "raf" };

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
    state: State,
    broker: ParticipantYBroker,
    ecsWorld: DecoratedECSWorld,
    worldDoc: WorldDoc,
    pageParams: PageParams,
    relmDocId: string,
    avConnection: AVConnection,
    participants: Map<string, Participant>
  ) {
    this.dispatch = dispatch;
    this.state = state;
    this.broker = broker;

    this.world = ecsWorld;
    this.worldDoc = worldDoc;
    this.subrelm = pageParams.relmName;
    this.entryway = pageParams.entryway;
    this.relmDocId = relmDocId;
    this.avConnection = avConnection;

    (window as any).THREE = THREE;

    this.selection = new SelectionManager(this.worldDoc);

    this.participants = new ParticipantManager(dispatch, broker, participants);

    this.chat = new ChatManager();
    this.chat.init(this.worldDoc.messages, (msg, state, value) => {
      this.participants.setCommunicatingState(msg, state, value);
    });

    // this.chat.setMessages(this.worldDoc.messages);

    this.camera = new CameraManager(
      this.world,
      this.participants.local.avatar.entities.body
    );

    this.world.perspective.setAvatar(this.avatar.entities.body);
    const light = makeLight(this.world, this.avatar.entities.body).activate();
    this.light = light;

    this.unsubs.push(
      this.worldDoc.settings.subscribe(($settings) => {
        const fog = this.world.presentation.scene.fog;
        if ($settings.get("fogColor")) {
          fog.color = new Color($settings.get("fogColor"));
        }
        if (typeof $settings.get("fogDensity") == "number") {
          (fog as any).density = $settings.get("fogDensity");
        }

        const ambient = $settings.get("ambientLightColor");
        if (ambient) this.ambientLight.color = new Color(ambient);

        const hemi1 = $settings.get("hemisphereLightColor");
        if (hemi1) this.hemisphereLight.color = new Color(hemi1);

        const hemi2 = $settings.get("hemisphereLightGroundColor");
        if (hemi2) this.hemisphereLight.groundColor = new Color(hemi2);

        const dirLC = $settings.get("directionalLightColor");
        const dirLP = $settings.get("directionalLightPos");
        if (this.directionalLight) {
          if (dirLC) this.directionalLight.color = new Color(dirLC);
          if (dirLP) this.directionalLight.position.fromArray(dirLP);
        } else {
          // ECS may not have created it yet, so prepare the entity instead
          if (dirLC) this.light.getByName("DirectionalLight").color = dirLC;
          if (dirLP) this.light.getByName("Follow").offset.fromArray(dirLP);
        }
      })
    );

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
      derived([worldUIMode, keyShift], ([$mode, $keyShift], set) => {
        set({ buildMode: $mode === "build", overrideInvisible: $keyShift });
      }).subscribe(({ buildMode, overrideInvisible }) => {
        this.avatar.enableCanFly(buildMode);
        this.avatar.enableNonInteractive(buildMode);
        if (overrideInvisible) {
          this.enableCollidersVisible(buildMode, true);
        }

        const buildModeShift = buildMode && overrideInvisible;

        this.enableNonInteractiveGround(!buildModeShift);
        this.enableBoundingVisible(buildModeShift);

        // Need to call enableCollidersVisible after enableNonInteractiveGround
        // because visible colliders test checks for NonInteractive component:
        if (!overrideInvisible) {
          this.enableCollidersVisible(buildMode, false);
        }
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

    // Pre-compile assets to prevent some jank while exploring the world
    this.world.presentation.compile();

    this.start();
  }

  async deinit() {
    this.broker.unsubscribe();

    await delay(30);

    this.unsubs.forEach((f) => f());
    this.unsubs.length = 0;

    this.worldDoc.disconnect();
    this.worldDoc.unsubscribe();

    this.scene.traverse((node) => (node as any).dispose?.());
    this.world.reset();

    this.camera.deinit();

    this.world = null;
    this.worldDoc = null;
    this.subrelm = null;
    this.entryway = null;
    this.relmDocId = null;
    this.avConnection = null;
    this.camera = null;
    this.participants = null;
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

  enableCollidersVisible(enabled = true, includeNonInteractive = false) {
    const entities = this.world.entities.getAllByComponent(Collider);
    for (const entity of entities) {
      const interactive = !entity.get(NonInteractive);
      entity.maybeRemove(ColliderVisible);
      if (enabled && (interactive || includeNonInteractive)) {
        entity.add(ColliderVisible);
      }
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
    if (!this.started) {
      this._startLoop();
      this.started = true;

      // Show via UI that we're playing
      playState.set("playing");
    }
  }

  _startLoop() {
    const loop = this.loop.bind(this);

    switch (this.loopType.type) {
      case "raf":
        this.world.presentation.setLoop(loop);
        break;

      case "interval":
        this.loopType.interval = setInterval(
          loop,
          (1.0 / this.loopType.targetFps) * 1000
        );
        break;

      default:
        throw Error("invalid loopType");
    }
  }

  stop() {
    if (this.started) {
      this._stopLoop();
      this.started = false;

      // Show via UI that we've paused
      playState.set("paused");
    }
  }

  _stopLoop() {
    switch (this.loopType.type) {
      case "raf":
        this.world.presentation.setLoop(null);
        break;

      case "interval":
        clearInterval(this.loopType.interval);
        break;

      default:
        throw Error("invalid loopType");
    }
  }

  togglePaused() {
    if (this.started) {
      this.stop();
    } else {
      this.start();
    }
  }

  step() {
    this.stop();
    requestAnimationFrame(this.loop.bind(this));
  }

  setFps(fps: number) {
    if (fps < 0 || fps > 60) return;

    this.stop();

    targetFps.set(fps);
    if (fps === 60) {
      this.loopType = { type: "raf" };
    } else {
      this.loopType = { type: "interval", targetFps: fps };
    }

    this.start();
  }

  worldStep(delta?: number) {
    if (this.world) {
      this.world.update(
        this.started && delta !== undefined ? delta : 1000 / 60
      );
    }
  }

  loop() {
    const time = performance.now();
    const delta = time - this.previousLoopTime;
    fpsTime.addData(1000 / delta);

    this.useTransformArray();

    this.worldStep(delta);

    this.participants.sendMyTransformData();

    this.camera.update(time);

    this.previousLoopTime = time;
  }

  setTransformArray(array) {
    this.transformArray = array;
  }

  useTransformArray() {
    if (!this.transformArray) return;

    setTransformArrayOnParticipants(
      this.world,
      this.participants.participants,
      this.transformArray,
      (participant) => {
        this.dispatch({ id: "participantJoined", participant });
      }
    );
  }

  async startScreenShare(onStop) {
    // start screen sharing
    const shareTrack = await createScreenTrack();
    if (onStop) shareTrack.on("stopped", onStop);
    localShareTrackStore.set(shareTrack);

    this.participants.setShowVideo(true);
  }

  async stopScreenShare() {
    // end screen sharing
    localShareTrackStore.set(null);

    if (!get(localVideoTrack)) {
      this.participants.setShowVideo(false);
    }
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

  moveTo(position: Vector3, instantaneousCamera = true) {
    const transform = this.participants.local.avatar.transform;
    transform.position.copy(position);
    transform.modified(); // update physics engine
    if (instantaneousCamera) this.camera.moveTo(position);
  }

  moveToXZ(x, z, instantaneousCamera = true) {
    const skyPoint = new Vector3(x, 10, z);
    const hitPoint = intersectionPointWithGround(this.world.physics, skyPoint);
    if (hitPoint) {
      this.moveTo(hitPoint, instantaneousCamera);
    } else {
      this.dispatch({
        id: "notify",
        notification: {
          text: `No ground at that point`,
          position: "bottom-center",
          removeAfter: 5000,
        },
      });
    }
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

  get copyBuffer(): CopyBuffer {
    return get(copyBuffer);
  }

  get boundingBox(): Box3 {
    const box = new Box3();
    box.setFromObject(this.scene);
    return box;
  }

  get ambientLight(): AmbientLight {
    return this.scene.getObjectByProperty(
      "type",
      "AmbientLight"
    ) as AmbientLight;
  }

  get hemisphereLight(): HemisphereLight {
    return this.scene.getObjectByProperty(
      "type",
      "HemisphereLight"
    ) as HemisphereLight;
  }

  get directionalLight(): DirectionalLight {
    return this.scene.getObjectByProperty(
      "type",
      "DirectionalLight"
    ) as DirectionalLight;
  }

  setLightPosition(position: Vector3) {
    this.light.get(Follow).offset.copy(position);
  }
}
