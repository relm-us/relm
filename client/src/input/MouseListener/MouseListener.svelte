<script lang="ts">
  import { Box2, Frustum, PerspectiveCamera, Vector2, Vector3 } from "three";
  import { difference } from "~/utils/setOps";
  import { hasAncestor } from "~/utils/hasAncestor";
  import { globalEvents } from "~/events";
  import * as selectionLogic from "./selectionLogic";

  import { IntersectionFinder } from "./IntersectionFinder";

  import { Entity } from "~/ecs/base";
  import { Controller } from "~/ecs/plugins/player-control";
  import {
    PointerPosition,
    PointerPositionRef,
  } from "~/ecs/plugins/pointer-position";
  import { Transform } from "~/ecs/plugins/core";
  import { WorldPlanes } from "~/ecs/shared/WorldPlanes";
  import type { PlaneOrientation } from "~/ecs/shared/WorldPlanes";
  import { uuidv4 } from "~/utils/uuid";

  import { Relm } from "~/stores/Relm";
  import { mode } from "~/stores/mode";
  import { hovered } from "~/stores/selection";
  import { mouse } from "~/stores/mouse";

  import { DRAG_DISTANCE_THRESHOLD } from "~/config/constants";
  import { isInputEvent } from "../isInputEvent";

  export let world;

  const pointerPosition = new Vector2();
  const pointerStartPosition = new Vector2();
  const dragPosition = new Vector3();
  const dragStartPosition = new Vector3();
  const dragStartCamera = new PerspectiveCamera();
  const dragStartFollowOffset = new Vector3();
  const dragStartTransformPosition = new Vector3();
  const v1 = new Vector3();

  let pointerState: "initial" | "click" | "drag" | "drag-select" = "initial";
  let pointerPosEntity;
  let dragOffset;
  let dragPlane: PlaneOrientation = "xz";
  let shiftKey = false;
  let selectionRectangle = new Box2();

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
    // becoming MouseListener click targets. TODO: make this less hacky?
    if (event.target.tagName === "OVERLAY" && $mode === "play") return false;

    // An HTML element whose ancestor is the viewport is in the "world" (i.e. not part of the UI)
    return hasAncestor(event.target, world.presentation.viewport);
  }

  function onPointermove(x, y) {
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
          dragPlane = shiftKey ? "xy" : "xz";
        } else {
          pointerState = "drag-select";
          dragPlane = "xz";
        }

        dragOffset = null;
        const position = $Relm.selection.centroid;

        pointerPosEntity = world.entities
          .create("MouseDragPointerPlane", uuidv4())
          .add(Transform, { position })
          .add(PointerPosition)
          .activate();
      } else if (pointerState === "drag") {
        // drag mode
        const ref = pointerPosEntity.get(PointerPositionRef);
        if (ref) {
          if (dragOffset) {
            const position = new Vector3().copy(ref.value.points[dragPlane]);
            position.sub(dragOffset);
            $Relm.selection.moveRelativeToSavedPositions(position);
          } else if (ref.updateCount > 1) {
            $Relm.selection.savePositions();
            dragOffset = new Vector3().copy(ref.value.points[dragPlane]);
          }
        }
      } else if (pointerState === "drag-select") {
        selectionLogic.getSelectionBox(
          $Relm.world,
          pointerStartPosition,
          pointerPosition,
          selectionRectangle
        );
        const p = new Vector2();
        for (let entity of $Relm.world.entities.entities.values()) {
          const position = entity.getByName("Transform")?.position;
          if (!position) continue;
          p.x = position.x;
          p.y = position.z; // note: switching from 3D XZ plane to 2D XY plane
          if (selectionRectangle.containsPoint(p)) {
            $Relm.selection.addEntityId(entity.id);
          }
        }
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
    onPointermove(event.clientX, event.clientY);
  }

  function onTouchMove(event: TouchEvent) {
    if (!eventTargetsWorld(event, $mode)) return;
    event.preventDefault();
    var touch = event.changedTouches[0];
    onPointermove(touch.clientX, touch.clientY);
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

    if (pointerPosEntity) {
      pointerPosEntity.destroy();
      pointerPosEntity = null;
    }

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
