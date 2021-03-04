<script lang="ts">
  import { Box2, Vector2, Vector3 } from "three";
  import { difference } from "~/utils/setOps";
  import { hasAncestor } from "~/utils/hasAncestor";
  import { globalEvents } from "~/events";
  import * as selectionLogic from "./selectionLogic";

  import { IntersectionFinder } from "./IntersectionFinder";

  import { TouchController } from "~/ecs/plugins/player-control";
  import { PointerPlane, PointerPlaneRef } from "~/ecs/plugins/pointer-plane";
  import { Transform } from "~/ecs/plugins/core";
  import { uuidv4 } from "~/utils/uuid";

  import { Relm } from "~/stores/Relm";
  import { mode } from "~/stores/mode";
  import { hovered } from "~/stores/selection";
  import { mouse } from "~/stores/mouse";

  import { DRAG_DISTANCE_THRESHOLD } from "~/config/constants";

  export let world;

  const mousePosition = new Vector2();
  const mouseStartPosition = new Vector2();
  let mouseMode: "initial" | "click" | "drag" | "drag-select" = "initial";
  let pointerPlaneEntity;
  let dragOffset;
  let dragPlane: "XZ" | "XY" = "XZ";
  let shiftKey = false;
  let selectionRectangle = new Box2();

  const finder = new IntersectionFinder(
    world.presentation.camera,
    world.presentation.scene
  );

  function setMousePositionFromEvent(event, isStart = false) {
    mousePosition.set(event.clientX, event.clientY);
    if (isStart) mouseStartPosition.copy(mousePosition);
  }

  function findIntersectionsAtMousePosition() {
    finder.castRay(mousePosition);
    return [...finder.find()].map((object) => object.userData.entityId);
  }

  function eventTargetsWorld(event) {
    return hasAncestor(event.target, world.presentation.viewport);
  }

  function removeTouchController() {
    if ($Relm.avatar.has(TouchController)) {
      $Relm.avatar.remove(TouchController);
    }
  }

  function onMousemove(event: MouseEvent) {
    if (!eventTargetsWorld(event)) return;

    globalEvents.emit("mouseActivity");

    setMousePositionFromEvent(event);

    const found = findIntersectionsAtMousePosition();
    // console.log("mouse.set", finder._normalizedCoords);
    mouse.set(finder._normalizedCoords);

    {
      // Keep svelte `hovered` store up to date based on mouse movements
      const foundSet: Set<string> = new Set(found);

      const added = difference(foundSet, $hovered);
      const deleted = difference($hovered, foundSet);

      for (const entityId of added) hovered.add(entityId);
      for (const entityId of deleted) hovered.delete(entityId);
    }

    if (
      mouseMode === "click" &&
      mousePosition.distanceTo(mouseStartPosition) > DRAG_DISTANCE_THRESHOLD
    ) {
      // drag  mode start
      if ($Relm.selection.length > 0) {
        mouseMode = "drag";
        dragPlane = shiftKey ? "XY" : "XZ";
      } else {
        mouseMode = "drag-select";
        dragPlane = "XZ";
      }

      dragOffset = null;
      const position = $Relm.selection.centroid;

      pointerPlaneEntity = world.entities
        .create("MouseDragPointerPlane", uuidv4())
        .add(Transform, { position })
        .add(PointerPlane, { visible: dragPlane })
        .activate();
    } else if (mouseMode === "drag") {
      // drag mode
      const ref = pointerPlaneEntity.get(PointerPlaneRef);
      if (ref) {
        if (dragOffset) {
          const position = new Vector3().copy(ref[dragPlane]);
          position.sub(dragOffset);
          $Relm.selection.moveRelativeToSavedPositions(position);
        } else if (ref.updateCount > 1) {
          $Relm.selection.savePositions();
          dragOffset = new Vector3().copy(ref[dragPlane]);
        }
      }
    } else if (mouseMode === "drag-select") {
      selectionLogic.getSelectionBox(
        $Relm.world,
        mouseStartPosition,
        mousePosition,
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
  }

  /**
   * Track mouse click events in connection with the object selection system
   *
   * @param event
   */
  function onMousedown(event: MouseEvent) {
    if (!eventTargetsWorld(event)) return;

    setMousePositionFromEvent(event, true);

    const found = findIntersectionsAtMousePosition();

    if ($mode === "build") {
      // At this point, at least a 'click' has started. TBD if it's a drag.
      mouseMode = "click";
      shiftKey = event.shiftKey;

      selectionLogic.mousedown(found, event.shiftKey);
    } else if ($mode === "play") {
      if (found.includes($Relm.avatar.id)) {
        $Relm.avatar.add(TouchController);
      }
    }
  }

  function onMouseup(event: MouseEvent) {
    if (!eventTargetsWorld(event)) return;

    if ($mode === "build") {
      if (mouseMode === "click") {
        selectionLogic.mouseup($Relm.selection);
      } else if (mouseMode === "drag") {
        $Relm.selection.syncEntities();
      }
    } else if ($mode === "play") {
      removeTouchController();
    }

    if (pointerPlaneEntity) {
      pointerPlaneEntity.destroy();
      pointerPlaneEntity = null;
    }

    // reset mouse mode
    mouseMode = "initial";
  }

  function onTouchStart(event: TouchEvent) {
    event.preventDefault();
    var touches = event.changedTouches;

    mousePosition.set(touches[0].clientX, touches[0].clientY);

    const found = findIntersectionsAtMousePosition();

    if ($mode === "build") {
      selectionLogic.mousedown(found, false);
    } else if ($mode === "play") {
      if (found.includes($Relm.avatar.id)) {
        $Relm.avatar.add(TouchController);
      }
    }
  }

  function onTouchMove(event: TouchEvent) {
    if (!eventTargetsWorld(event)) return;

    globalEvents.emit("mouseActivity");

    event.preventDefault();
    var touches = event.changedTouches;
    mousePosition.set(touches[0].clientX, touches[0].clientY);

    const found = findIntersectionsAtMousePosition();
    mouse.set(finder._normalizedCoords);
  }

  function onTouchEnd(event: TouchEvent) {
    if ($mode === "build") {
      // TODO?
    } else if ($mode === "play") {
      removeTouchController();
    }
  }
</script>

<svelte:window
  on:mousemove={onMousemove}
  on:mousedown={onMousedown}
  on:mouseup={onMouseup}
  on:touchstart={onTouchStart}
  on:touchmove={onTouchMove}
  on:touchend={onTouchEnd}
  on:touchcancel={onTouchEnd}
/>
