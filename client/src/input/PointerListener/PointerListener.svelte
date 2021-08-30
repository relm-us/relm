<script lang="ts">
  import { PerspectiveCamera, Vector2, Vector3 } from "three";
  import { difference } from "~/utils/setOps";
  import { hasAncestor } from "~/utils/hasAncestor";
  import { globalEvents } from "~/events";
  import * as selectionLogic from "./selectionLogic";

  import { IntersectionFinder } from "./IntersectionFinder";

  import { Entity } from "~/ecs/base";
  import { Controller } from "~/ecs/plugins/player-control";
  import { PointerPositionRef } from "~/ecs/plugins/pointer-position";
  import { WorldPlanes } from "~/ecs/shared/WorldPlanes";

  import { Relm } from "~/stores/Relm";
  import { mode } from "~/stores/mode";
  import { hovered } from "~/stores/selection";
  import { mouse } from "~/stores/mouse";

  import type { DecoratedWorld } from "~/types/DecoratedWorld";
  import { DRAG_DISTANCE_THRESHOLD } from "~/config/constants";
  import { isInputEvent } from "../isInputEvent";
  import { DragPlane } from "./DragPlane";
  import { SelectionBox } from "./SelectionBox";

  export let world: DecoratedWorld;

  const pointerPosition = new Vector2();
  const pointerStartPosition = new Vector2();
  const dragPosition = new Vector3();
  const dragStartPosition = new Vector3();
  const dragStartCamera = new PerspectiveCamera();
  const dragStartFollowOffset = new Vector3();
  const dragStartTransformPosition = new Vector3();
  const v1 = new Vector3();
  const dragPlane = new DragPlane(world);
  const selectionBox = new SelectionBox(world);

  let pointerState: "initial" | "click" | "drag" | "drag-select" = "initial";
  let dragOffset;
  let shiftKey = false;

  const finder = new IntersectionFinder(
    world.presentation.camera,
    world.presentation.scene
  );

  function addTouchController(entity: Entity) {
    const controller = entity.get(Controller);
    controller.touchEnabled = true;
  }

  function removeTouchController(entity: Entity) {
    const controller = entity.get(Controller);
    controller.touchEnabled = false;
  }

  function findIntersectionsAtPointerPosition() {
    finder.castRay(pointerPosition);
    const findings = [...finder.find()];
    return findings.map((object) => object.userData.entityId);
  }

  function eventTargetsWorld(event, $mode) {
    // Allow dragging Html2d objects, as well as selecting text
    if (isInputEvent(event)) return false;

    // Prevent Renderable overlays (e.g. over websites) from erroneously
    // becoming PointerListener click targets. TODO: make this less hacky?
    if (event.target.tagName === "OVERLAY" && $mode === "play") return false;

    // An HTML element whose ancestor is the viewport is in the "world" (i.e. not part of the UI)
    return hasAncestor(event.target, world.presentation.viewport);
  }

  function onPointerMove(x, y, moveShiftKey) {
    pointerPosition.set(x, y);

    globalEvents.emit("mouseActivity");

    const found = findIntersectionsAtPointerPosition();

    mouse.set(finder._normalizedCoords);

    if ($mode === "build") {
      {
        // Keep svelte `hovered` store up to date based on mouse movements
        const foundSet: Set<string> = new Set(found);

        const added = difference(foundSet, $hovered);
        const deleted = difference($hovered, foundSet);

        for (const entityId of added) hovered.add(entityId);
        for (const entityId of deleted) hovered.delete(entityId);
      }

      if (
        pointerState === "click" &&
        pointerPosition.distanceTo(pointerStartPosition) >
          DRAG_DISTANCE_THRESHOLD
      ) {
        // drag  mode start
        if ($Relm.selection.length > 0) {
          pointerState = "drag";
          dragPlane.setOrientation(shiftKey ? "xy" : "xz");
        } else {
          pointerState = "drag-select";
          dragPlane.setOrientation("xz");
          selectionBox.show();
          selectionBox.setStart(pointerStartPosition);
          selectionBox.setEnd(pointerStartPosition);
        }

        dragOffset = null;

        // console.log(
        //   "centroid",
        //   $Relm.selection.length,
        //   $Relm.selection.centroid
        // );
        // dragPlane.setCenter($Relm.selection.centroid);
        dragPlane.show();
      } else if (pointerState === "drag") {
        // drag mode
        const ref = dragPlane.entity.get(PointerPositionRef);
        if (ref) {
          if (dragOffset) {
            const position = new Vector3().copy(
              ref.value.points[dragPlane.orientation]
            );
            position.sub(dragOffset);
            $Relm.selection.moveRelativeToSavedPositions(position);
          } else if (ref.updateCount > 1) {
            $Relm.selection.savePositions();
            dragOffset = new Vector3().copy(
              ref.value.points[dragPlane.orientation]
            );
          }
        }
      } else if (pointerState === "drag-select") {
        if (moveShiftKey) {
          selectionBox.setTop(pointerPosition);
        } else {
          selectionBox.setEnd(pointerPosition);
        }

        const contained = selectionBox.getContainedEntities();

        $Relm.selection.clear(true);
        $Relm.selection.addEntityIds(contained);
      }
    } else if ($mode === "play") {
      const follow = $Relm.camera.entity.getByName("Follow");
      const transform = $Relm.camera.entity.getByName("Transform");
      if (!follow || !transform) return;

      const planes: WorldPlanes = $Relm.world.perspective.getAvatarPlanes();

      if (
        pointerState === "click" &&
        pointerPosition.distanceTo(pointerStartPosition) >
          DRAG_DISTANCE_THRESHOLD
      ) {
        dragStartFollowOffset.copy($Relm.camera.pan);
        dragStartTransformPosition.copy(transform.position);

        // drag  mode start
        pointerState = "drag";
        dragOffset = new Vector3();
        dragStartCamera.copy(planes.camera);
        dragStartPosition.copy(planes.points.xz);
      } else if (pointerState === "drag") {
        // We can't copy planes.points.xz coords here, because the camera itself
        // may be following the drag, so we need to use the previous projection
        planes.getWorldFromScreen(pointerPosition, dragPosition, {
          camera: dragStartCamera,
        });

        dragOffset
          .copy(dragPosition)
          .sub(dragStartPosition)
          .sub(dragStartFollowOffset);
        v1.copy(dragStartFollowOffset).sub(dragOffset);

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

  function onPointerDown(x, y, eventShiftKey) {
    pointerPosition.set(x, y);
    pointerStartPosition.set(x, y);

    const found = findIntersectionsAtPointerPosition();

    if ($mode === "build") {
      // At this point, at least a 'click' has started. TBD if it's a drag.
      pointerState = "click";
      shiftKey = eventShiftKey;

      selectionLogic.mousedown(found, eventShiftKey);
    } else if ($mode === "play") {
      if (found.includes($Relm.avatar.id)) {
        addTouchController($Relm.avatar);
      } else {
        // At this point, at least a 'click' has started. TBD if it's a drag.
        pointerState = "click";
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
      removeTouchController($Relm.avatar);
    }

    dragPlane.hide();
    selectionBox.hide();

    // reset mouse mode
    pointerState = "initial";
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
