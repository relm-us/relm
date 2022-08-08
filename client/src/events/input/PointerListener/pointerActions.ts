import { Object3D, Vector2, Vector3 } from "three";
import { get } from "svelte/store";

import { globalEvents } from "~/events";
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

import { DRAG_DISTANCE_THRESHOLD } from "~/config/constants";
import { Draggable } from "~/ecs/plugins/clickable/components/Draggable";
import { Entity } from "~/ecs/base";
import { isInteractive } from "~/utils/isInteractive";

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
  | "drag-select";

export let pointerStateDelayed: PointerState = "initial";
let pointerState: PointerState = "initial";
let pointerDownFound: string[] = [];
let dragOffset: Vector3 = new Vector3();
let pointerPoint: Vector3;
let interactiveEntity: Entity;
let shiftKeyOnClick = false;

export function onPointerDown(x: number, y: number, shiftKey: boolean) {
  const $mode = get(worldUIMode);
  const world = worldManager.world;
  const finder = world.presentation.intersectionFinder;

  pointerPosition.set(x, y);
  pointerStartPosition.set(x, y);

  pointerDownFound = finder.entityIdsAt(pointerPosition);

  if ($mode === "build") {
    // At this point, at least a 'click' has started. TBD if it's a drag.
    setNextPointerState("click");
    shiftKeyOnClick = shiftKey;

    selectionLogic.mousedown(pointerDownFound, shiftKey);
    pointerPoint = pointerPointInSelection(
      worldManager.selection,
      pointerDownFound
    );

    if (pointerPoint) worldManager.dragPlane.setOrigin(pointerPoint);
  } else if ($mode === "play") {
    interactiveEntity = firstInteractiveEntity(pointerDownFound);

    if (
      pointerDownFound.includes(worldManager.avatar.entities.body.id as string)
    ) {
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

      if (pointerDownFound.length > 0) {
        const position = clickedPosition(pointerDownFound[0], world);
        worldManager.dragPlane.setOrigin(position);
      } else {
        const planes: WorldPlanes =
          worldManager.world.perspective.getAvatarPlanes();
        const position = new Vector3();
        planes.getWorldFromScreen(pointerPosition, position);
        worldManager.dragPlane.setOrigin(position);
      }
    }
  }
}

export function onPointerUp(event: MouseEvent | TouchEvent) {
  if (isControllingTransform) {
    if (pointerState !== "initial") setNextPointerState("initial");
    return;
  }

  const $mode = get(worldUIMode);

  if ($mode === "build") {
    if (pointerState === "click") {
      selectionLogic.mouseup(worldManager.selection);
    } else if (pointerState === "drag") {
      worldManager.selection.syncEntities();
    }
  } else if ($mode === "play") {
    if (
      (pointerState === "click" || pointerState == "interactive-click") &&
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
    } else if (isControllingAvatar) {
      removeTouchController(worldManager.avatar.entities.body);
      isControllingAvatar = false;
    }
  }

  // dragPlane.hide();
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

  globalEvents.emit("mouseActivity");

  const pointerMoveFound = finder.entityIdsAt(pointerPosition);

  mouse.set(finder._normalizedCoord);

  if ($mode === "build") {
    if (pointerState === "click" && atLeastMinDragDistance()) {
      // drag  mode start
      if (worldManager.selection.length > 0 && pointerPoint) {
        setNextPointerState("drag");
        worldManager.selection.savePositions();
        worldManager.dragPlane.setOrientation(shiftKeyOnClick ? "XY" : "XZ");
      } else {
        setNextPointerState("drag-select");
        worldManager.selectionBox.show();
        worldManager.selectionBox.setStart(pointerStartPosition);
        worldManager.selectionBox.setEnd(pointerStartPosition);
      }
    } else if (pointerState === "drag") {
      // drag mode
      const delta = worldManager.dragPlane.getDelta(pointerPosition);
      worldManager.selection.moveRelativeToSavedPositions(delta);
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
