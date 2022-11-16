import { Euler, Object3D, Vector2, Vector3 } from "three";
import { get } from "svelte/store";

import { globalEvents } from "~/events/globalEvents";
import { pointerPointInSelection } from "./selectionLogic";
import * as selectionLogic from "./selectionLogic";

import {
  addTouchController,
  removeTouchController,
} from "~/ecs/plugins/player-control";
import { Object3DRef } from "~/ecs/plugins/core";
import { WorldPlanes } from "~/ecs/shared/WorldPlanes";
import { Clickable, Clicked } from "~/ecs/plugins/clickable";

import { worldManager } from "~/world";
import { worldUIMode } from "~/stores/worldUIMode";
import { mouse } from "~/stores/mouse";

import {
  CAMERA_ROTATE_RATE,
  DRAG_DISTANCE_THRESHOLD,
} from "~/config/constants";
import { Draggable } from "~/ecs/plugins/clickable/components/Draggable";
import { Entity } from "~/ecs/base";
import { isInteractive } from "~/utils/isInteractive";
import { dragAction } from "~/stores/dragAction";

export let isControllingAvatar: boolean = false;
export let isControllingTransform: boolean = false;

export function setControl(value: boolean) {
  isControllingTransform = value;
}

const pointerPosition = new Vector2();
const pointerStartPosition = new Vector2();
const cameraPanOffset = new Vector3();

type PointerState =
  | "initial"
  | "click"
  | "drag"
  | "interactive-click"
  | "interactive-drag"
  | "drag-select"
  | "drag-camera";

export let pointerStateDelayed: PointerState = "initial";
let pointerState: PointerState = "initial";
let pointerDownFound: string[] = [];
let dragOffset: Vector3 = new Vector3();
let pointerPoint: Vector3;
let interactiveEntity: Entity;
let shiftKeyOnClick = false;
const cameraStartDirection = new Euler();

export function onPointerDown(x: number, y: number, shiftKey: boolean) {
  const $mode = get(worldUIMode);
  const world = worldManager.world;
  const finder = world.presentation.intersectionFinder;

  pointerPosition.set(x, y);
  pointerStartPosition.set(x, y);

  if ($mode === "build") {
    // At this point, at least a 'click' has started. TBD if it's a drag.
    setNextPointerState("click");
    shiftKeyOnClick = shiftKey;

    setDragPlaneOrigin(pointerPosition);

    // Don't allow clicking other avatars in build mode
    pointerDownFound = finder
      .entityIdsAt(pointerPosition)
      .filter(havingAvatar(false));

    // Begin tracking what was clicked on, in case this is a click
    selectionLogic.mousedown(pointerDownFound, shiftKey);
    pointerPoint = pointerPointInSelection(
      worldManager.selection,
      pointerDownFound
    );

    if (pointerPoint) worldManager.dragPlane.setOrigin(pointerPoint);
  } else if ($mode === "play") {
    interactiveEntity = firstInteractiveEntity(pointerDownFound);

    pointerDownFound = finder.entityIdsAt(pointerPosition);

    const { avatarBody, local } = getAvatarAmongFound(pointerDownFound);

    if (avatarBody && local) {
      addTouchController(worldManager.avatar.entities.body);
      isControllingAvatar = true;
    } else if (interactiveEntity?.has(Draggable)) {
      // Clicked on an interactive entity, perhaps starting a play-mode drag?
      setNextPointerState("interactive-click");

      const draggable = interactiveEntity.get(Draggable);
      const dragPlane = worldManager.dragPlane;
      dragPlane.setOrientation(draggable.plane);
      dragPlane.setOrigin(clickedPosition(interactiveEntity.id, world));

      worldManager.selection.clear();
      worldManager.selection.addEntityId(interactiveEntity.id);
    } else {
      // At this point, at least a 'click' has started. TBD if it's a drag.
      setNextPointerState("click");
      worldManager.dragPlane.setOrientation("XZ");

      setDragPlaneOrigin(pointerPosition);
    }
  }
}

export function onPointerUp() {
  if (isControllingTransform) {
    if (pointerState !== "initial") setNextPointerState("initial");
    return;
  }

  const $mode = get(worldUIMode);
  if (pointerState === "drag-camera") {
    worldManager.camera.setModeFollow();
  } else if ($mode === "build") {
    if (pointerState === "click") {
      selectionLogic.mouseup(worldManager.selection);
    } else if (pointerState === "drag") {
      worldManager.selection.syncEntities();
    }
  } else if ($mode === "play") {
    const { avatarBody, local } = getAvatarAmongFound(pointerDownFound);

    if (isControllingAvatar) {
      removeTouchController(worldManager.avatar.entities.body);
      isControllingAvatar = false;
    } else if (avatarBody && !local) {
      // Broadcast participantId of the avatar that was clicked
      globalEvents.emit("interact-other-avatar", avatarBody.id as string);
    } else if (
      (pointerState === "click" || pointerState === "interactive-click") &&
      pointerDownFound.length > 0
    ) {
      // Even though there may be several entities stacked under the pointer,
      // we only want to trigger the front-most (visible) thing as clicked.
      const entities = worldManager.world.entities;
      const frontMostEntity = entities.getById(pointerDownFound[0]);
      if (frontMostEntity.has(Clickable)) {
        frontMostEntity.add(Clicked);
      }
    } else if (pointerState === "interactive-drag") {
      worldManager.selection.syncEntities();
      interactiveEntity = null;
    }
  }

  worldManager.selectionBox.hide();

  // reset mouse mode
  setNextPointerState("initial");
}

export function onPointerMove(x: number, y: number, shiftKeyOnMove: boolean) {
  if (isControllingTransform) {
    if (pointerState !== "initial") setNextPointerState("initial");
    return;
  }

  const $mode = get(worldUIMode);
  const world = worldManager.world;
  const finder = world.presentation.intersectionFinder;

  pointerPosition.set(x, y);

  const pointerMoveFound = finder.entityIdsAt(pointerPosition);

  mouse.set(finder._normalizedCoord);

  if (pointerState === "click" && get(dragAction) === "rotate") {
    cameraStartDirection.copy(worldManager.camera.direction);
    setNextPointerState("drag-camera");
  } else if (pointerState === "drag-camera") {
    const dist = pointerStartPosition.x - pointerPosition.x;
    worldManager.camera.rotate(
      cameraStartDirection.y + dist / CAMERA_ROTATE_RATE
    );
  } else if ($mode === "build") {
    if (pointerState === "click" && atLeastMinDragDistance()) {
      // drag  mode start
      if (worldManager.selection.length > 0 && pointerPoint) {
        setNextPointerState("drag");
        worldManager.selection.savePositions();
        worldManager.dragPlane.setOrientation(shiftKeyOnClick ? "XY" : "XZ");
      } else {
        // TODO: Make selection box possible as a mode/tool?
        //
        // setNextPointerState("drag-select");
        // worldManager.selectionBox.show();
        // worldManager.selectionBox.setStart(pointerStartPosition);
        // worldManager.selectionBox.setEnd(pointerStartPosition);

        setNextPointerState("drag");
        cameraPanOffset.copy(worldManager.camera.pan);
      }
    } else if (pointerState === "drag") {
      if (worldManager.selection.length > 0 && pointerPoint) {
        // Translate selected objects
        const delta = worldManager.dragPlane.getDelta(pointerPosition);
        worldManager.selection.moveRelativeToSavedPositions(delta);
      } else {
        // Pan camera in build mode:
        const delta = worldManager.dragPlane.getDelta(pointerPosition);
        dragOffset.copy(delta).sub(cameraPanOffset);
        worldManager.camera.setPan(-dragOffset.x, -dragOffset.z);
      }
    } else if (pointerState === "drag-select") {
      if (shiftKeyOnMove) {
        worldManager.selectionBox.setTop(pointerPosition);
      } else {
        worldManager.selectionBox.setEnd(pointerPosition);
      }

      const contained = worldManager.selectionBox.getContainedEntityIds();

      worldManager.selection.clear(true);
      worldManager.selection.addEntityIds(contained);
    }
  } else if ($mode === "play" && !isControllingAvatar) {
    if (pointerState === "interactive-click" && atLeastMinDragDistance()) {
      setNextPointerState("interactive-drag");
      worldManager.selection.savePositions();
    } else if (pointerState === "interactive-drag") {
      const delta = worldManager.dragPlane.getDelta(pointerPosition);
      const draggable = interactiveEntity.get(Draggable);
      worldManager.selection.moveRelativeToSavedPositions(delta, (position) => {
        if (draggable.grid) {
          if (draggable.plane.includes("X")) {
            position.x =
              Math.floor(position.x / draggable.gridSize) * draggable.gridSize +
              draggable.gridOffset.x;
          }
          if (draggable.plane.includes("Y")) {
            position.y =
              Math.floor(position.y / draggable.gridSize) * draggable.gridSize +
              draggable.gridOffset.y;
          }
          if (draggable.plane.includes("Z")) {
            position.z =
              Math.floor(position.z / draggable.gridSize) * draggable.gridSize +
              draggable.gridOffset.y; // intentionally using 'y' of 2d for z of 3d here
          }
        }
      });
    } else if (pointerState === "click" && atLeastMinDragDistance()) {
      // drag  mode start
      setNextPointerState("drag");
      cameraPanOffset.copy(worldManager.camera.pan);
    } else if (pointerState === "drag") {
      const delta = worldManager.dragPlane.getDelta(pointerPosition);
      dragOffset.copy(delta).sub(cameraPanOffset);
      worldManager.camera.setPan(-dragOffset.x, -dragOffset.z);
    } else {
      // hovering over clickable/draggable results in outline
      worldManager.hoverOutline(firstInteractiveEntity(pointerMoveFound));
    }
  }
}

export function setNextPointerState(nextState: PointerState) {
  if (
    nextState === "drag" ||
    nextState === "drag-select" ||
    nextState === "interactive-drag"
  ) {
    document.body.classList.add("pointer-events-none");
  } else {
    document.body.classList.remove("pointer-events-none");
  }
  pointerState = nextState;

  // Allow external components to react to state after release
  setTimeout(() => (pointerStateDelayed = nextState), 100);
}

function firstInteractiveEntity(entityIds: string[]) {
  return entityIds
    .map((entityId) => worldManager.world.entities.getById(entityId))
    .find((entity) => isInteractive(entity));
}

const havingAvatar = (yes: boolean) => (entityId) => {
  const name = worldManager.world.entities.getById(entityId).name;
  if (yes) return name === "Avatar";
  else return name !== "Avatar";
};

function atLeastMinDragDistance() {
  return (
    pointerPosition.distanceTo(pointerStartPosition) >= DRAG_DISTANCE_THRESHOLD
  );
}

function clickedPosition(entityId, world) {
  const entity = world.entities.getById(entityId);
  const object3d: Object3D = entity?.get(Object3DRef)?.value;
  return object3d?.userData.lastIntersectionPoint;
}

function setDragPlaneOrigin(screenPosition: Vector2) {
  const planes: WorldPlanes = worldManager.world.perspective.getAvatarPlanes();
  const position = new Vector3();
  planes.getWorldFromScreen(screenPosition, position);
  worldManager.dragPlane.setOrigin(position);
}

function getAvatarAmongFound(foundEntityIds: string[]): {
  avatarBody: Entity;
  local: boolean;
} {
  const avatarEntities = foundEntityIds
    .map((entityId) => worldManager.world.entities.getById(entityId))
    .filter((entity) => entity.name === "Avatar");
  if (avatarEntities.length > 0) {
    return {
      avatarBody: avatarEntities[0],
      local: avatarEntities[0] === worldManager.avatar.entities.body,
    };
  } else {
    return {
      avatarBody: null,
      local: false,
    };
  }
}
