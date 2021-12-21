<script lang="ts">
  import { PerspectiveCamera, Vector2, Vector3 } from "three";
  import { hasAncestor } from "~/utils/hasAncestor";
  import { globalEvents } from "~/events";
  import { pointerPointInSelection } from "./selectionLogic";
  import * as selectionLogic from "./selectionLogic";

  import { IntersectionFinder } from "./IntersectionFinder";

  import {
    addTouchController,
    removeTouchController,
  } from "~/ecs/plugins/player-control";
  import { Object3D } from "~/ecs/plugins/core";
  import { WorldPlanes } from "~/ecs/shared/WorldPlanes";
  import { Clickable, Clicked } from "~/ecs/plugins/clickable";

  import { Relm } from "~/stores/Relm";
  import { mode } from "~/stores/mode";
  import { mouse } from "~/stores/mouse";

  import type { DecoratedWorld } from "~/types/DecoratedWorld";
  import { DRAG_DISTANCE_THRESHOLD } from "~/config/constants";
  import { isInputEvent } from "../isInputEvent";
  import { DragPlane } from "./DragPlane";
  import { SelectionBox } from "./SelectionBox";

  export let world: DecoratedWorld;

  const pointerPosition = new Vector2();
  const pointerStartPosition = new Vector2();
  const cameraPanOffset = new Vector3();
  const dragPlane = new DragPlane(world);
  const selectionBox = new SelectionBox(world);

  type PointerState = "initial" | "click" | "drag" | "drag-select";

  let pointerState: PointerState = "initial";
  let pointerDownFound: string[] = [];
  let dragOffset: Vector3 = new Vector3();
  let pointerPoint: Vector3;
  let shiftKeyOnClick = false;

  function setNextPointerState(nextState: PointerState) {
    if (nextState === "drag" || nextState === "drag-select") {
      document.body.classList.add("pointer-events-none");
    } else {
      document.body.classList.remove("pointer-events-none");
    }
    pointerState = nextState;
  }

  const finder = new IntersectionFinder(
    world.presentation.camera,
    world.presentation.scene
  );

  function eventTargetsWorld(event, $mode) {
    // Allow dragging Html2d objects, as well as selecting text
    if (isInputEvent(event)) return false;

    // Prevent Renderable overlays (e.g. over websites) from erroneously
    // becoming PointerListener click targets. TODO: make this less hacky?
    if (event.target.tagName === "OVERLAY" && $mode === "play") return false;

    // An HTML element whose ancestor is the viewport is in the "world" (i.e. not part of the UI)
    return hasAncestor(event.target, world.presentation.viewport);
  }

  function onPointerMove(x: number, y: number, shiftKeyOnMove: boolean) {
    pointerPosition.set(x, y);

    globalEvents.emit("mouseActivity");

    const found = finder.entityIdsAt(pointerPosition);

    mouse.set(finder._normalizedCoord);

    if ($mode === "build") {
      if (
        pointerState === "click" &&
        pointerPosition.distanceTo(pointerStartPosition) >=
          DRAG_DISTANCE_THRESHOLD
      ) {
        // drag  mode start
        if ($Relm.selection.length > 0 && pointerPoint) {
          setNextPointerState("drag");
          $Relm.selection.savePositions();
          dragPlane.setOrientation(shiftKeyOnClick ? "xy" : "xz");
          // dragPlane.show();
        } else {
          setNextPointerState("drag-select");
          selectionBox.show();
          selectionBox.setStart(pointerStartPosition);
          selectionBox.setEnd(pointerStartPosition);
        }
      } else if (pointerState === "drag") {
        // drag mode
        const delta = dragPlane.getDelta(pointerPosition);
        $Relm.selection.moveRelativeToSavedPositions(delta);
      } else if (pointerState === "drag-select") {
        if (shiftKeyOnMove) {
          selectionBox.setTop(pointerPosition);
        } else {
          selectionBox.setEnd(pointerPosition);
        }

        const contained = selectionBox.getContainedEntityIds();

        $Relm.selection.clear(true);
        $Relm.selection.addEntityIds(contained);
      }
    } else if ($mode === "play") {
      if (
        pointerState === "click" &&
        pointerPosition.distanceTo(pointerStartPosition) >=
          DRAG_DISTANCE_THRESHOLD
      ) {
        // drag  mode start
        setNextPointerState("drag");
        cameraPanOffset.copy($Relm.camera.pan);
      } else if (pointerState === "drag") {
        const delta = dragPlane.getDelta(pointerPosition);
        dragOffset.copy(delta).sub(cameraPanOffset);
        $Relm.camera.setPan(-dragOffset.x, -dragOffset.z);
      }
    }
  }

  function onMouseMove(event: MouseEvent) {
    if (!eventTargetsWorld(event, $mode)) return;
    onPointerMove(event.clientX, event.clientY, event.shiftKey);
  }

  function onTouchMove(event: TouchEvent) {
    if (!eventTargetsWorld(event, $mode)) return;
    event.preventDefault();
    var touch = event.changedTouches[0];
    onPointerMove(touch.clientX, touch.clientY, event.shiftKey);
  }

  function onPointerDown(x: number, y: number, shiftKey: boolean) {
    pointerPosition.set(x, y);
    pointerStartPosition.set(x, y);

    pointerDownFound = finder.entityIdsAt(pointerPosition);

    if ($mode === "build") {
      // At this point, at least a 'click' has started. TBD if it's a drag.
      setNextPointerState("click");
      shiftKeyOnClick = shiftKey;

      selectionLogic.mousedown(pointerDownFound, shiftKey);
      pointerPoint = pointerPointInSelection($Relm.selection, pointerDownFound);
      if (pointerPoint) dragPlane.setOrigin(pointerPoint);
    } else if ($mode === "play") {
      if (pointerDownFound.includes($Relm.avatar.entity.id as string)) {
        addTouchController($Relm.avatar.entity);
      } else {
        // At this point, at least a 'click' has started. TBD if it's a drag.
        setNextPointerState("click");
        dragPlane.setOrientation("xz");
        if (pointerDownFound.length > 0) {
          const position = clickedPosition(pointerDownFound[0], world);
          dragPlane.setOrigin(position);
        } else {
          const planes: WorldPlanes = $Relm.world.perspective.getAvatarPlanes();
          const position = new Vector3();
          planes.getWorldFromScreen(pointerPosition, position);
          dragPlane.setOrigin(position);
        }
      }
    }
  }

  function onMouseDown(event: MouseEvent) {
    if (!eventTargetsWorld(event, $mode)) return;
    onPointerDown(event.clientX, event.clientY, event.shiftKey);
  }

  function onTouchStart(event: TouchEvent) {
    if (!eventTargetsWorld(event, $mode)) return;
    event.preventDefault();
    var touch = event.changedTouches[0];
    onPointerDown(touch.clientX, touch.clientY, event.shiftKey);
  }

  function onPointerUp(event: MouseEvent | TouchEvent) {
    if (!eventTargetsWorld(event, $mode)) return;

    if ($mode === "build") {
      if (pointerState === "click") {
        selectionLogic.mouseup($Relm.selection);
      } else if (pointerState === "drag") {
        $Relm.selection.syncEntities();
      }
    } else if ($mode === "play") {
      if (pointerState === "click" && pointerDownFound.length > 0) {
        const entities = $Relm.world.entities;
        pointerDownFound.forEach((entityId) => {
          const entity = entities.getById(entityId);
          if (entity.has(Clickable)) {
            entity.add(Clicked);
          }
        });
      } else {
        removeTouchController($Relm.avatar.entity);
      }
    }

    // dragPlane.hide();
    selectionBox.hide();

    // reset mouse mode
    setNextPointerState("initial");
  }

  function clickedPosition(entityId, world) {
    const entity = world.entities.getById(entityId);
    const object3d = entity?.get(Object3D)?.value;
    return object3d?.userData.lastIntersectionPoint;
  }
</script>

<svelte:window
  on:mousemove={onMouseMove}
  on:mousedown={onMouseDown}
  on:mouseup={onPointerUp}
  on:touchstart={onTouchStart}
  on:touchmove={onTouchMove}
  on:touchend={onPointerUp}
  on:touchcancel={onPointerUp}
/>
