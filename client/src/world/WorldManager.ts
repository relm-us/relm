import {
  Color,
  Vector3,
  Box3,
  AmbientLight,
  HemisphereLight,
  DirectionalLight,
  Clock,
} from "three";
import * as THREE from "three";
import { Security } from "relm-common";

(window as any).THREE = THREE;

import { derived, get } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { exportRelm, importRelm } from "./Export";

import { worldUIMode } from "~/stores/worldUIMode";
import { fpsTime } from "~/stores/stats";
import { targetFps } from "~/stores/targetFps";
import { copyBuffer, CopyBuffer } from "~/stores/copyBuffer";

// Animation keys
import { key1, key2, key3 } from "~/stores/keys";
import { keyLeft, keyRight, keyUp, keyDown, keySpace } from "~/stores/keys";
import {
  CAMERA_BUILD_DAMPENING,
  CAMERA_BUILD_ZOOM_MAX,
  CAMERA_BUILD_ZOOM_MIN,
  CAMERA_PLAY_DAMPENING,
  CAMERA_PLAY_ZOOM_MAX,
  CAMERA_PLAY_ZOOM_MIN,
  FPS_SLOWDOWN_MIN_FPS,
  FPS_SLOWDOWN_TIMEOUT,
  OCULUS_HEIGHT_SIT,
  OCULUS_HEIGHT_STAND,
  RAISING_HAND,
  STAND_SIT,
  WAVING,
} from "~/config/constants";

import { config } from "~/config";

import { DragPlane } from "~/events/input/PointerListener/DragPlane";
import { SelectionBox } from "~/events/input/PointerListener/SelectionBox";
import { setControl } from "~/events/input/PointerListener/pointerActions";

import { makeLight } from "~/prefab/makeLight";

import { Entity } from "~/ecs/base";
import { Collider2 } from "~/ecs/plugins/physics";
import { NonInteractive } from "~/ecs/plugins/non-interactive";
import { ControllerState } from "~/ecs/plugins/player-control";
import { Follow } from "~/ecs/plugins/follow";
import { intersectionPointWithGround } from "~/ecs/shared/isMakingContactWithGround";
import { Transition } from "~/ecs/plugins/transition";
import { CameraSystem } from "~/ecs/plugins/camera/systems";
import { TransformControls } from "~/ecs/plugins/transform-controls";
import { Collider2VisibleSystem } from "~/ecs/plugins/collider-visible/systems";

import { Inventory } from "~/identity/Inventory";
import { SelectionManager } from "./SelectionManager";
import { ChatManager } from "./ChatManager";
import { CameraManager } from "./CameraManager";

import type { DecoratedECSWorld, PageParams } from "~/types";
import type { Dispatch, State } from "~/main/ProgramTypes";

import { AVConnection } from "~/av";
import { localShareTrackStore } from "~/av/localVisualTrackStore";
import { localVideoTrack } from "video-mirror";
import { createScreenTrack } from "~/av/twilio/createScreenTrack";

import { participantId } from "~/identity/participantId";
import { Avatar } from "~/identity/Avatar";
import { Participant } from "~/types/identity";
import { ParticipantManager } from "~/identity/ParticipantManager";
import { ParticipantBroker } from "~/identity/ParticipantBroker";
import { delay } from "~/utils/delay";
import { RelmRestAPI } from "~/main/RelmRestAPI";
import { PhotoBooth } from "./PhotoBooth";
import { audioMode, AudioMode } from "~/stores/audioMode";
import { Outline } from "~/ecs/plugins/outline";
import { InteractorSystem } from "~/ecs/plugins/interactor";
import { Object3DRef } from "~/ecs/plugins/core";
import { globalEvents } from "~/events";
import { advancedEdit } from "~/stores/advancedEdit";
import { errorCat } from "~/stores/errorCat";
import { viewportScale } from "~/stores/viewportScale";
import { dragAction } from "~/stores/dragAction";
import { openDialog } from "~/stores/openDialog";
import { LoginManager } from "~/identity/LoginManager";
import { graphicsQuality } from "~/stores/graphicsQuality";
import { Oculus } from "~/ecs/plugins/html2d";
import { rollRandomAppearance } from "~/identity/Avatar/appearance";

type LoopType =
  | { type: "reqAnimFrame" }
  | { type: "nolimit"; running: boolean }
  | { type: "interval"; targetFps: number; interval?: NodeJS.Timer };

export class WorldManager {
  dispatch: Dispatch;
  state: State;
  broker: ParticipantBroker;
  api: RelmRestAPI;
  clock: Clock;
  security: Security;

  world: DecoratedECSWorld;
  worldDoc: WorldDoc;
  relmName: string;
  entryway: string;
  relmDocId: string;
  avConnection: AVConnection;

  // Make key state available for debugging
  keyLeft = keyLeft;
  keyRight = keyRight;
  keyUp = keyUp;
  keyDown = keyDown;
  keySpace = keySpace;

  lastActivity: number = 0;
  lastFpsChange: number = 0;

  myDataLastSentAt: number = 0;

  loopType: LoopType = { type: "reqAnimFrame" };
  fpsLocked: boolean = false;

  light: Entity;

  logins: LoginManager;
  participants: ParticipantManager;
  inventory: Inventory;
  selection: SelectionManager;
  chat: ChatManager;
  camera: CameraManager;
  photoBooth: PhotoBooth;

  hoverOutlineEntity: Entity;
  transformEntity: Entity;

  _dragPlane: DragPlane;
  _selectionBox: SelectionBox;

  started: boolean = false;

  unsubs: Function[] = [];
  afterInitFns: Function[] = [];
  didInit: boolean = false;
  didDeinit: boolean = false;

  get dragPlane(): DragPlane {
    if (!this._dragPlane) this._dragPlane = new DragPlane(this.world);
    return this._dragPlane;
  }

  get selectionBox(): SelectionBox {
    if (!this._selectionBox) this._selectionBox = new SelectionBox(this.world);
    return this._selectionBox;
  }

  async init(
    dispatch: Dispatch,
    state: State,
    broker: ParticipantBroker,
    ecsWorld: DecoratedECSWorld,
    worldDoc: WorldDoc,
    pageParams: PageParams,
    relmDocId: string,
    avConnection: AVConnection,
    participants: Map<string, Participant>,
    security: Security
  ) {
    this.dispatch = dispatch;
    this.state = state;
    this.broker = broker;
    this.api = new RelmRestAPI(
      config.serverUrl,
      state.pageParams.relmName,
      state.authHeaders
    );
    this.clock = new Clock();
    this.security = security;

    this.world = ecsWorld;
    this.worldDoc = worldDoc;
    this.relmName = pageParams.relmName;
    this.entryway = pageParams.entryway;
    this.relmDocId = relmDocId;
    this.avConnection = avConnection;

    (window as any).THREE = THREE;

    this.selection = new SelectionManager(this);

    this.participants = new ParticipantManager(
      dispatch,
      broker,
      participants
    ).init();

    // It's important that broker.subscribe() happen AFTER the
    // ParticipantManager exists and starts listening:
    this.broker.subscribe();

    this.logins = new LoginManager(
      this.api,
      dispatch,
      security,
      this.participants
    );

    this.inventory = new Inventory(
      this.api,
      this.world,
      this.participants.local
    );
    this.inventory.init();

    this.chat = new ChatManager();
    this.chat.init(this.worldDoc.messages, (msg, state, value) => {
      this.participants.setCommunicatingState(msg, state, value);
    });

    this.camera = new CameraManager(this.world, this.avatar.entities.body);

    this.photoBooth = new PhotoBooth();

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

        const fov = $settings.get("cameraFov");
        if (fov) this.camera.setFov(fov);

        const audioModeSetting: AudioMode = $settings.get("audioMode");
        if (audioModeSetting === "proximity") {
          audioMode.set("proximity");
        } else {
          audioMode.set("world");
        }
      })
    );

    this.camera.init();

    this.world.perspective.setAvatar(this.avatar.entities.body);

    this.unsubs.push(
      errorCat.subscribe(($enabled) => {
        this.world.entities
          .getAllBy((e) => e.name === "Error")
          .forEach((entity) => {
            const html2d = entity.getByName("Html2d");
            if (!html2d) return;
            html2d.visible = $enabled;
            html2d.modified();
          });
      })
    );

    this.unsubs.push(
      graphicsQuality.subscribe(($quality) => {
        let shadows, pixelRatio, framerate;

        switch ($quality) {
          case 0:
            shadows = false;
            pixelRatio = 0.25;
            framerate = 20;
            break;
          case 1:
            shadows = false;
            pixelRatio = 0.5;
            framerate = 30;
            break;
          case 2:
            shadows = false;
            pixelRatio = 1;
            framerate = 30;
            break;
          case 3:
            shadows = false;
            pixelRatio = window.devicePixelRatio;
            framerate = 60;
            break;
          case 4:
            shadows = true;
            pixelRatio = window.devicePixelRatio;
            framerate = 60;
            break;

          default:
            console.warn("Invalid graphics quality setting", $quality);
        }

        this.enableShadows(shadows);

        this.setPixelRatio(pixelRatio);

        this.setFps(framerate, true);
      })
    );

    this.unsubs.push(
      worldUIMode.subscribe(($mode) => {
        switch ($mode) {
          case "build":
            this.hoverOutline(null);
            this.world.systems.get(InteractorSystem).active = false;

            // Always turn advanced edit off when entering build mode
            advancedEdit.set(false);

            this.camera.setZoomRange(
              CAMERA_BUILD_ZOOM_MIN,
              CAMERA_BUILD_ZOOM_MAX
            );
            this.camera.dampening = CAMERA_BUILD_DAMPENING;

            break;
          case "play":
            this.world.systems.get(InteractorSystem).active = true;
            this.hideTransformControls();

            this.camera.setZoomRange(
              CAMERA_PLAY_ZOOM_MIN,
              CAMERA_PLAY_ZOOM_MAX
            );
            this.camera.dampening = CAMERA_PLAY_DAMPENING;

            // Reset camera direction to "north"
            this.camera.direction.y = 0;
            this.camera.setModeFollow();

            // Center the avatar on camera
            this.camera.center();

            break;
        }
      })
    );

    const toggleAdvancedEdit = () => advancedEdit.update((value) => !value);
    globalEvents.on("advanced-edit", toggleAdvancedEdit);
    this.unsubs.push(() =>
      globalEvents.off("advanced-edit", toggleAdvancedEdit)
    );

    const toggleDragAction = () =>
      dragAction.update((value) => (value === "pan" ? "rotate" : "pan"));
    globalEvents.on("toggle-drag-action", toggleDragAction);
    this.unsubs.push(() =>
      globalEvents.off("toggle-drag-action", toggleDragAction)
    );

    const toggleSelectionAsGroup = () => this.selection.toggleGroup();
    globalEvents.on("toggle-selection-as-group", toggleSelectionAsGroup);
    this.unsubs.push(() =>
      globalEvents.off("toggle-drag-action", toggleSelectionAsGroup)
    );

    const cameraRotateLeft = () => this.camera.rotateLeft90();
    globalEvents.on("camera-rotate-left", cameraRotateLeft);
    this.unsubs.push(() =>
      globalEvents.off("camera-rotate-left", cameraRotateLeft)
    );

    const cameraRotateRight = () => this.camera.rotateRight90();
    globalEvents.on("camera-rotate-right", cameraRotateRight);
    this.unsubs.push(() =>
      globalEvents.off("camera-rotate-right", cameraRotateRight)
    );

    // Make colliders visible in build mode
    this.unsubs.push(
      derived(
        [worldUIMode, advancedEdit],
        (
          [$mode, $advanced],
          set: (value: {
            buildMode: boolean;
            overrideInvisible: boolean;
          }) => void
        ) => {
          set({ buildMode: $mode === "build", overrideInvisible: $advanced });
        }
      ).subscribe(({ buildMode, overrideInvisible }) => {
        this.avatar.enableCanFly(buildMode);
        this.avatar.enableNonInteractive(buildMode);
        this.avatar.enableInteractor(!buildMode);

        this.enableCollidersVisible(buildMode);

        const buildModeShift = buildMode && overrideInvisible;
        this.enableNonInteractiveGround(!buildModeShift);
      })
    );

    let sitting = false;
    this.unsubs.push(
      derived(
        [worldUIMode, key1, key2, key3],
        (
          [$mode, $key1, $key2, $key3],
          set: (anim: { clipName: string; loop: boolean }) => void
        ) => {
          if ($mode === "play" && $key1) {
            set({ clipName: WAVING, loop: true });
            sitting = false;
          } else if ($mode === "play" && $key2) {
            if (sitting) {
              set(null);
            } else {
              set({ clipName: STAND_SIT, loop: false });
            }
            sitting = !sitting;
          } else if ($mode === "play" && $key3) {
            set({ clipName: RAISING_HAND, loop: false });
            sitting = false;
          } else if (!sitting) {
            set(null);
          }
        }
      ).subscribe((anim: { clipName: string; loop: boolean }) => {
        const oculus = this.avatar?.entities.body.getByName("Oculus");
        if (oculus) {
          if (anim?.clipName === STAND_SIT) {
            oculus.targetOffset.y = OCULUS_HEIGHT_SIT;
          } else {
            oculus.targetOffset.y = OCULUS_HEIGHT_STAND;
          }
        }
        const state: ControllerState =
          this.avatar.entities.body.get(ControllerState);
        if (!state) return;
        state.animOverride = anim;
      })
    );

    const fpsCheckInterval = setInterval(() => {
      if (!this.started || this.fpsLocked) return;

      const now = performance.now();
      if (now - this.lastActivity > FPS_SLOWDOWN_TIMEOUT) {
        const currFps = this.getTargetFps();
        if (
          now - this.lastFpsChange > FPS_SLOWDOWN_TIMEOUT &&
          currFps > FPS_SLOWDOWN_MIN_FPS
        ) {
          let newFps = currFps - 10;
          if (newFps < FPS_SLOWDOWN_MIN_FPS) newFps = FPS_SLOWDOWN_MIN_FPS;
          this.setFps(newFps);
        }
      }
    }, 500);
    this.unsubs.push(() => {
      clearInterval(fpsCheckInterval);
    });

    this.unsubs.push(
      viewportScale.subscribe(($scale) => {
        this.didChangeZoom();
      })
    );

    // Pre-compile assets to prevent some jank while exploring the world
    this.world.presentation.compile();

    this.start();

    this.afterInitFns.forEach((fn) => fn());
    this.afterInitFns.length = 0;
    this.didInit = true;
    this.didDeinit = false;

    const camsys = this.world.systems.get(CameraSystem) as CameraSystem;
    camsys.beginDeactivatingOffCameraEntities();
    camsys.addEverythingToSet();
  }

  async deinit() {
    if (this.didDeinit) {
      console.trace("worldManager.deinit already called; skipping");
      return;
    } else {
      console.trace("worldManager.deinit");
    }

    this.broker.unsubscribe();

    await delay(30);

    this.unsubs.forEach((f) => f());
    this.unsubs.length = 0;

    this.worldDoc.unsubscribe();

    this.scene.traverse((node) => (node as any).dispose?.());
    this.world.systems.systems.forEach((system) => (system.active = false));
    this.world.reset();

    this.camera.deinit();
    this.participants.deinit();

    this.dragPlane.deinit();

    const camsys = this.world.systems.get(CameraSystem) as CameraSystem;
    camsys.endDeactivatingOffCameraEntities();

    this._dragPlane = null;
    this._selectionBox = null;
    this.world = null;
    this.worldDoc = null;
    this.relmName = null;
    this.entryway = null;
    this.relmDocId = null;
    this.avConnection = null;
    this.camera = null;
    this.participants = null;

    this.didInit = false;
    this.didDeinit = true;
    this.fpsLocked = false;
  }

  afterInit(fn: Function) {
    if (this.didInit) fn();
    else this.afterInitFns.push(fn);
  }

  getColliderEntities() {
    return this.world.entities.getAllBy((entity) => entity.has(Collider2));
  }

  enableNonInteractiveGround(enabled = true) {
    const action = enabled ? "add" : "maybeRemove";
    const entities = this.getColliderEntities();
    for (const entity of entities) {
      if (entity.has(Collider2)) {
        const collider: Collider2 = entity.get(Collider2);
        if (collider.kind === "GROUND") {
          entity[action](NonInteractive);
        }
      }
    }
  }

  enableCollidersVisible(enabled = true) {
    Collider2VisibleSystem.enabled = enabled;
  }

  enableShadows(enabled) {
    this.world.presentation.renderer.shadowMap.enabled = enabled;

    const spec = this.light.getByName("DirectionalLight");
    spec.shadow = enabled;
    spec.modified();
  }

  hoverOutline(found: Entity) {
    if (found) {
      if (!found.has(Outline)) {
        this.hoverOutlineEntity?.maybeRemove(Outline);
        found.add(Outline);
        this.hoverOutlineEntity = found;
      }
    } else if (this.hoverOutlineEntity) {
      this.hoverOutlineEntity.maybeRemove(Outline);
      this.hoverOutlineEntity = null;
    }
  }

  topView(height: number = 40, hideAvatar: boolean = true) {
    const avatar = this.participants.local.avatar;

    this.camera.setModeAbove(height);
    if (avatar && hideAvatar) {
      avatar.entities.body.traverse((e) => {
        e.getByName("Object3D").value.visible = false;
      });
    }
    (this.world.presentation.scene.fog as any).density = 0;
  }

  setPixelRatio(n) {
    this.world.presentation.renderer.setPixelRatio(n);
    this.world.presentation.resize();
  }

  getRelmUrl() {
    return window.location.origin + "/" + this.state.pageParams.relmName;
  }

  didControlAvatar() {
    this.lastActivity = performance.now();

    // As soon as avatar moves, restore full 60fps framerate
    if (this.loopType.type !== "reqAnimFrame" && !this.fpsLocked) {
      this.setFps(60);
    }
  }

  didChangeZoom() {
    this.didControlAvatar();
    CameraSystem.stageNeedsUpdate = true;
  }

  showTransformControls(entity, onChange?: Function) {
    this.transformEntity = entity;

    entity.add(TransformControls, {
      onChange,
      onBegin: (entity) => {
        setControl(true);
        this.selection.savePositions();
      },
      onComplete: (entity) => {
        setControl(false);
        this.selection.syncEntities();
      },
      onMove: (entity, delta) => {
        this.selection.moveRelativeToSavedPositions(delta);
      },
      onRotate: (entity, center, theta, axis) => {
        this.selection.rotate(center, theta, axis);
      },
    });
  }

  hideTransformControls() {
    if (this.transformEntity) {
      this.transformEntity.remove(TransformControls);
      this.transformEntity = null;
    }
  }

  start() {
    if (!this.started) {
      this._startLoop();
      this.started = true;
    }
  }

  stop() {
    if (this.started) {
      this._stopLoop();
      this.started = false;
    }
  }

  _startLoop() {
    const loop = this.loop.bind(this);

    switch (this.loopType.type) {
      case "reqAnimFrame":
        this.world.presentation.setLoop(loop);
        break;

      case "nolimit":
        this.loopType.running = true;
        const noLimitLoop = () => {
          loop();
          if (this.loopType.type == "nolimit" && this.loopType.running)
            setTimeout(noLimitLoop, 0);
        };
        noLimitLoop();
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

  _stopLoop() {
    switch (this.loopType.type) {
      case "reqAnimFrame":
        this.world.presentation.setLoop(null);
        break;

      case "nolimit":
        this.loopType.running = false;
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
      openDialog.set("pause");
    } else {
      this.start();
      openDialog.set(null);
    }
  }

  step() {
    this.stop();
    requestAnimationFrame(this.loop.bind(this));
  }

  getTargetFps(): number {
    // prettier-ignore
    switch (this.loopType.type) {
      case "reqAnimFrame": return 60;
      case "nolimit": return 60;
      case "interval": return this.loopType.targetFps;
    }
  }

  setFps(fps: number, lock = false) {
    this.stop();

    if (lock) this.lockFps();

    if (fps === 60) {
      targetFps.set(60);
      this.loopType = { type: "reqAnimFrame" };
    } else if (fps === null) {
      targetFps.set(null);
      this.loopType = { type: "nolimit", running: true };
    } else {
      if (fps < 0 || fps > 60) {
        console.warn("Can't set FPS to ", fps);
        return;
      }
      targetFps.set(fps);
      this.loopType = { type: "interval", targetFps: fps };
    }

    this.lastFpsChange = performance.now();

    this.start();
  }

  lockFps() {
    this.fpsLocked = true;
  }

  unlockFps() {
    this.fpsLocked = false;
  }

  worldStep(delta?: number) {
    if (this.world) {
      try {
        this.world.update(
          this.started && delta !== undefined ? delta : 1000 / 60
        );
      } catch (err) {
        console.error(err);
      }
    }
  }

  rerollAppearance() {
    this.participants.setAppearance(rollRandomAppearance());
  }

  refreshOculii() {
    this.world.entities.getAllByComponent(Oculus).forEach((entity) => {
      const oculus: Oculus = entity.get(Oculus);
      oculus.clearCache();

      // After visiting the video-mirror screen, each Svelte Video component
      // except the local video loses its feed, so we need to remove/add
      // each one back:
      oculus.modified();
    });
  }

  loop() {
    const delta = this.clock.getDelta();

    fpsTime.addData(delta === 0 ? 60 : 1 / delta);

    this.participants.applyOthersRapidData(this.world);

    this.worldStep(delta);

    const now = performance.now();
    if (now - this.myDataLastSentAt >= 50) {
      this.participants.sendMyRapidData();
      this.myDataLastSentAt = now;
    }

    this.camera.update(delta);
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

  findGroundAtXZ(x, z) {
    const skyPoint = new Vector3(x, 100, z);
    const hitPoint = intersectionPointWithGround(this.world.physics, skyPoint);
    return hitPoint;
  }

  moveToXZ(x, z, instantaneousCamera = true) {
    const hitPoint = this.findGroundAtXZ(x, z);
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

  moveThingLocally(entityId: string, position: Vector3) {
    const entity: Entity = this.world.entities.getById(entityId);
    if (entity.has(Transition)) {
      const transition = entity.get(Transition);
      transition.position.copy(position);
      transition.positionSpeed = 0.1;
    } else {
      entity.add(Transition, { position, positionSpeed: 0.1 });
    }
  }

  /**
   * Convenience Accessors
   */

  get participantId() {
    return participantId;
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

  getObject3D(idx: number) {
    const entities = [...this.world.entities.entities.values()];
    if (idx >= 0 && idx < entities.length) {
      return entities[idx].get(Object3DRef).value;
    }
  }

  showAll() {
    const scroll = document.createElement("div");
    scroll.style.position = "absolute";
    scroll.style.zIndex = "5";
    scroll.style.top = "0px";
    scroll.style.overflowY = "scroll";
    scroll.style.height = "100%";
    document.body.appendChild(scroll);

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    scroll.appendChild(container);

    for (let i = 0; i < this.world.entities.entities.size; i++) {
      try {
        const object = this.getObject3D(i);
        const img = this.photoBooth.takeShot(object);
        img.style.width = "150px";
        img.style.height = "150px";
        container.appendChild(img);
      } catch (err) {
        console.warn(err);
      }
    }
  }
}
