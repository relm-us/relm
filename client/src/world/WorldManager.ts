import type { RigidBody } from "@dimforge/rapier3d";

import type {
  DecoratedECSWorld,
  PageParams,
  AnimationOverride,
  ParticipantMap,
  UpdateData,
  ActionSitChair,
} from "~/types";

import type { Dispatch, State } from "~/main/ProgramTypes";

import {
  Color,
  Vector3,
  Box3,
  AmbientLight,
  HemisphereLight,
  DirectionalLight,
  Clock,
  Quaternion,
} from "three";
import * as THREE from "three";
import { localVideoTrack } from "~/ui/VideoMirror";
import { derived, get } from "svelte/store";
import { toast } from "@zerodevx/svelte-toast";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { exportRelm, importRelm } from "./Export";

import { worldUIMode } from "~/stores/worldUIMode";
import { fpsTime } from "~/stores/stats";
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
} from "~/config/constants";

import { config } from "~/config";

import { DragPlane } from "~/events/input/PointerListener/DragPlane";
import { SelectionBox } from "~/events/input/PointerListener/SelectionBox";
import { setControl } from "~/events/input/PointerListener/pointerActions";

import { makeLight } from "~/prefab/makeLight";

import { Entity } from "~/ecs/base";
import { Collider2, Collider2Ref } from "~/ecs/plugins/collider";
import { NonInteractive } from "~/ecs/plugins/non-interactive";
import { Seat } from "~/ecs/plugins/player-control";
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

import { AVConnection } from "~/av";
import { localShareTrackStore } from "~/av/localVisualTrackStore";
import { createScreenTrack } from "~/av/twilio/createScreenTrack";

import { participantId } from "~/identity/participantId";
import { Avatar } from "~/identity/Avatar";
import { ParticipantManager } from "~/identity/ParticipantManager";
import { ParticipantBroker } from "~/identity/ParticipantBroker";
import { delay } from "~/utils/delay";
import { RelmRestAPI } from "~/main/RelmRestAPI";
import { PhotoBooth } from "./PhotoBooth";
import { audioMode, AudioMode } from "~/stores/audioMode";
import { Outline } from "~/ecs/plugins/outline";
import { InteractorSystem } from "~/ecs/plugins/interactor";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { globalEvents } from "~/events/globalEvents";
import { advancedEdit } from "~/stores/advancedEdit";
import { errorCat } from "~/stores/errorCat";
import { viewportScale } from "~/stores/viewportScale";
import { dragAction } from "~/stores/dragAction";
import { openDialog } from "~/stores/openDialog";
import { LoginManager } from "~/identity/LoginManager";
import { graphicsQuality } from "~/stores/graphicsQuality";
import { Oculus } from "~/ecs/plugins/html2d";
import { rollRandomAppearance } from "~/identity/Avatar/appearance";
import { releaseAllKeys } from "~/events/input/comboTable";
import { portalOccupancy } from "~/stores/portalOccupancy";
import { fantasySkin } from "~/stores/fantasySkin";

// Make THREE accessible for debugging
(window as any).THREE = THREE;

type LoopType =
  | { type: "framerate"; fps: number }
  | { type: "nolimit"; running: boolean };

export class WorldManager {
  dispatch: Dispatch;
  state: State;
  broker: ParticipantBroker;
  api: RelmRestAPI;
  clock: Clock;

  world: DecoratedECSWorld;
  worldDoc: WorldDoc;
  relmName: string;
  entryway: string;
  relmDocId: string;
  avConnection: AVConnection;
  audioZone: string;

  // Make key state available for debugging
  keyLeft = keyLeft;
  keyRight = keyRight;
  keyUp = keyUp;
  keyDown = keyDown;
  keySpace = keySpace;

  lastActivity: number = 0;
  lastFpsChange: number = 0;

  myDataLastSentAt: number = 0;

  loopType: LoopType = { type: "framerate", fps: 30 };

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

  get occupancy() {
    return get(portalOccupancy);
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
    participants: ParticipantMap
  ) {
    this.dispatch = dispatch;
    this.state = state;
    this.broker = broker;
    this.api = new RelmRestAPI(
      config.serverUrl,
      state.authHeaders,
      state.pageParams.relmName
    );
    this.clock = new Clock();

    this.world = ecsWorld;
    this.worldDoc = worldDoc;
    this.relmName = pageParams.relmName;
    this.entryway = pageParams.entryway;
    this.relmDocId = relmDocId;
    this.avConnection = avConnection;
    this.audioZone = null;

    (window as any).THREE = THREE;

    this.selection = new SelectionManager(this);

    this.participants = new ParticipantManager(
      dispatch,
      broker,
      avConnection,
      participants
    ).init();

    // It's important that broker.subscribe() happen AFTER the
    // ParticipantManager exists and starts listening:
    this.broker.subscribe();

    this.logins = new LoginManager(this.api, {
      notify: (notification: string) => {
        toast.push(notification);
      },
      setLocalIdentity: (identityData: UpdateData) => {
        this.dispatch({
          id: "updateLocalIdentityData",
          identityData,
        });
      },
    });

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

        const fantasySkinEnabled: boolean = $settings.get("fantasySkin");
        fantasySkin.set(fantasySkinEnabled);
      })
    );

    this.camera.init();

    this.world.perspective.setAvatar(this.avatar.entities.body);

    const onHashChange = (event: HashChangeEvent) => {
      let newEntryway = location.hash.replace(/^\#/, "");
      if (newEntryway === "") newEntryway = "default";

      const entryways = get(this.worldDoc.entryways) as Map<
        string,
        [number, number, number]
      >;
      const arr = entryways.get(newEntryway);
      if (arr) {
        this.moveTo(new Vector3().fromArray(arr));
      } else {
        toast.push(`'${newEntryway}' isn't an entryway`);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    this.unsubs.push(() =>
      window.removeEventListener("hashchange", onHashChange)
    );

    const onUrlChange = (event: PopStateEvent) => {
      let relmName = window.location.pathname.replace(/^\//, "");
      if (relmName === "") relmName = "default";

      if (relmName !== this.relmName) {
        let entryway = window.location.hash.replace(/^\#/, "");
        if (entryway === "") entryway = "default";

        dispatch({ id: "enterPortal", relmName, entryway });
      }
    };
    window.addEventListener("popstate", onUrlChange);
    this.unsubs.push(() => window.removeEventListener("popstate", onUrlChange));

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
        this.applyGraphicsQuality($quality);
      })
    );

    this.unsubs.push(
      worldUIMode.subscribe(($mode) => {
        const buildMode = $mode === "build";

        this.avatar.enableCanFly(buildMode);
        this.avatar.enableNonInteractive(buildMode);

        this.enableInteraction(!buildMode);
        this.enableCollidersVisible(buildMode);

        switch ($mode) {
          case "build":
            this.hoverOutline(null);

            // Always turn advanced edit off when entering build mode
            advancedEdit.set(false);

            // Allow buiders to zoom out farther, faster
            this.camera.setZoomRange(
              CAMERA_BUILD_ZOOM_MIN,
              CAMERA_BUILD_ZOOM_MAX
            );
            this.camera.dampening = CAMERA_BUILD_DAMPENING;

            // Build mode ground-dragging default action
            dragAction.set("pan");

            break;
          case "play":
            this.hideTransformControls();

            this.camera.setZoomRange(
              CAMERA_PLAY_ZOOM_MIN,
              CAMERA_PLAY_ZOOM_MAX
            );
            this.camera.dampening = CAMERA_PLAY_DAMPENING;

            // Reset camera direction to "north"
            this.camera.direction.y = 0;
            this.camera.setModeFollow();

            // Play mode ground-dragging default action
            dragAction.set(
              localStorage.getItem("defaultDrag") === "rotate"
                ? "rotate"
                : "pan"
            );

            // Center the avatar on camera
            this.camera.center();

            break;
        }
      })
    );

    // Enable/disable ability to select "GROUND" type colliders in build mode
    this.unsubs.push(
      derived([worldUIMode, advancedEdit], ([$mode, $advanced]) => {
        this.enableInteractiveGround($mode === "build" && $advanced);
      }).subscribe(() => {})
    );

    const toggleAdvancedEdit = () => advancedEdit.update((value) => !value);
    globalEvents.on("toggle-advanced-edit", toggleAdvancedEdit);
    this.unsubs.push(() =>
      globalEvents.off("toggle-advanced-edit", toggleAdvancedEdit)
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

    this.unsubs.push(
      derived(
        [worldUIMode, key1, key2, key3, keySpace],
        (
          [$mode, $key1, $key2, $key3, $keySpace],
          set: (anim: AnimationOverride) => void
        ) => {
          if ($mode !== "play") {
            this.participants.setAction({ state: "free" });
            // TODO: Is this the best option for build mode? Send them to
            //       the Main audio zone? It's better than keeping them
            //       "trapped" in an audio zone, e.g. switching to build
            //       mode while seated.
            this.changeAudioZone(null);
            return;
          }

          const action = this.participants.local.actionState;

          switch (action.state) {
            case "free": {
              if ($key1) {
                this.participants.setAction({ state: "waving" });
              } else if ($key2) {
                this.participants.setAction({ state: "sit-ground" });
              } else if ($key3) {
                this.participants.setAction({ state: "raise-hand" });
              } else if ($keySpace && InteractorSystem.selected?.has(Seat)) {
                const transform: Transform =
                  InteractorSystem.selected.get(Transform);
                const position: Vector3 = new Vector3().copy(
                  transform.position
                );

                const seat: Seat = InteractorSystem.selected.get(Seat);

                // Place the avatar at the designated location within the "seat" object
                const offset = new Vector3().copy(seat.offset);
                offset.applyQuaternion(transform.rotation);
                position.add(offset);

                // Face the avatar at the designated (default) direction
                const rotation = new Quaternion().copy(transform.rotation);
                rotation.multiply(seat.forward);

                seat.seated = true;

                if (seat.zone !== "") {
                  this.changeAudioZone(seat.zone);
                }

                this.participants.setAction({
                  state: "sit-chair",
                  seat,
                  position,
                  rotation,
                });

                // Don't let participants seat-hop or interact with other objects nearby;
                // spacebar should always let them dismount
                this.enableInteraction(false);
              }
              break;
            }

            case "waving": {
              if (!$key1) {
                this.participants.setAction({ state: "free" });
              }
              break;
            }

            case "raise-hand": {
              if (!$key3) {
                this.participants.setAction({ state: "free" });
              }
              break;
            }

            case "sit-ground": {
              if ($key1 || $key2 || $key3 || $keySpace) {
                this.participants.setAction({ state: "free" });
              }
              break;
            }

            case "sit-chair": {
              if ($key1 || $key2 || $key3 || $keySpace) {
                this.enableInteraction(true);

                action.seat.seated = false;

                if (action.seat.zone !== "") {
                  this.changeAudioZone(null);
                }

                this.participants.setAction({ state: "leave-chair" });
              }
              break;
            }
          }
        }
      ).subscribe(() => {})
    );

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
  }

  afterInit(fn: Function) {
    if (this.didInit) fn();
    else this.afterInitFns.push(fn);
  }

  getColliderEntities() {
    return this.world.entities.getAllBy((entity) => entity.has(Collider2));
  }

  changeAudioZone(zone: string = null) {
    if (zone === this.audioZone) return;

    if (zone === null) {
      toast.push(`Entered Main Audio Zone`, {
        classes: ["audio"],
      });
    } else {
      toast.push(`Entered Audio Zone: ${zone}`, {
        classes: ["audio"],
      });
    }

    this.dispatch({
      id: "rejoinAudioVideo",
      zone,
    });

    this.audioZone = zone;
  }

  applyGraphicsQuality(quality) {
    const dpr = window.devicePixelRatio;
    const table = {
      0: [20, 0.25, false],
      1: [30, 0.5, false],
      2: [30, 1, false],
      3: [60, dpr, false],
      4: [60, dpr, true],
    };

    if (!(quality in table)) {
      console.warn("Invalid graphics quality setting", quality);
      return;
    }

    this.applyGraphicsSettings.apply(this, table[quality]);
  }

  applyGraphicsSettings(fps, pixelRatio, shadows) {
    this.enableShadows(shadows);
    this.setPixelRatio(pixelRatio);
    this.setFps(fps);
  }

  restoreGraphicsQuality() {
    this.applyGraphicsQuality(get(graphicsQuality));
  }

  enableInteractiveGround(enabled = true) {
    const action = enabled ? "maybeRemove" : "add";
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

  enableInteraction(enabled = true) {
    const system = this.world.systems.get(InteractorSystem) as InteractorSystem;
    system.active = enabled;
    if (!enabled) {
      system.deselect();
    }
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
  }

  didChangeZoom() {
    this.didControlAvatar();
    CameraSystem.stageNeedsUpdate = true;
  }

  showTransformControls(entity, onChange?: Function) {
    if (!entity) {
      // TODO: why is entity null in some cases?
      //       see https://discord.com/channels/755888642370699265/817782963222609941/1039208106950918225
      console.warn("can't show transform controls, entity is null");
      return;
    }

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
      fpsTime.clear();
      releaseAllKeys();
      this.started = false;
    }
  }

  _startLoop() {
    switch (this.loopType.type) {
      case "framerate":
        const targetFps = this.loopType.fps;
        let accum = 0;
        const loop = () => {
          accum += targetFps;
          if (accum >= 60) {
            this.loop();
            accum -= 60;
          }
        };
        this.world.presentation.setLoop(loop);
        break;

      case "nolimit":
        this.loopType.running = true;
        const noLimitLoop = () => {
          this.loop();
          if (this.loopType.type == "nolimit" && this.loopType.running)
            setTimeout(noLimitLoop, 0);
        };
        noLimitLoop();
        break;

      default:
        throw Error("invalid loopType");
    }
  }

  _stopLoop() {
    switch (this.loopType.type) {
      case "framerate":
        this.world.presentation.setLoop(null);
        break;

      case "nolimit":
        this.loopType.running = false;
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
    if (!this.started) return 0;

    // prettier-ignore
    switch (this.loopType.type) {
      case "framerate": return this.loopType.fps;
      case "nolimit": return 60;
    }
  }

  setFps(fps: number) {
    this.stop();

    if (fps === null) {
      this.loopType = { type: "nolimit", running: true };
    } else if (Number.isInteger(fps) && fps > 0 && fps <= 60) {
      this.loopType = { type: "framerate", fps };
    } else {
      console.warn("Can't set FPS to ", fps);
      return;
    }

    this.lastFpsChange = performance.now();

    this.start();
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

    this.participants.maybeSaveLastLocation(this.relmName, this.entryway);

    this.camera.update(delta);
  }

  async startScreenShare(onStop) {
    // start screen sharing
    const shareTrack = await createScreenTrack();
    if (onStop) shareTrack.on("stopped", onStop);
    localShareTrackStore.set(shareTrack);

    this.participants.setVideo(true);
  }

  async stopScreenShare() {
    // end screen sharing
    localShareTrackStore.set(null);

    if (!get(localVideoTrack)) {
      this.participants.setVideo(false);
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
    // TODO: Why do we have to move the physics body?
    // Problem: When holding down the arrow key into a portal, `transform.modified()`
    // is insufficient to move the avatar.
    const body: RigidBody = this.avatar.entities.body.get(Collider2Ref)?.body;
    if (body) {
      body.setTranslation(position, true);
    } else {
      const transform = this.participants.local.avatar.transform;
      transform.position.copy(position);
      transform.modified(); // update physics engine
    }
    if (instantaneousCamera) this.camera.moveTo(position);
  }

  moveToXZ(x, z, instantaneousCamera = true) {
    const hitPoint = this.findGroundAtXZ(x, z);
    if (hitPoint) {
      this.moveTo(hitPoint, instantaneousCamera);
    } else {
      toast.push(`No ground at that point`);
    }
  }

  maybeRestoreLastLocation(): boolean {
    const position = this.participants.maybeGetLastLocation(
      this.relmName,
      this.entryway
    );
    if (position) {
      this.moveTo(position);
      return true;
    } else {
      return false;
    }
  }

  findGroundAtXZ(x, z) {
    const skyPoint = new Vector3(x, 100, z);
    const hitPoint = intersectionPointWithGround(this.world.physics, skyPoint);
    return hitPoint;
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
