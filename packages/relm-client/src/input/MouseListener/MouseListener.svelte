<script lang="ts">
  import { hovered } from "~/stores/selection";
  import { Vector2, Vector3 } from "three";
  import { difference } from "~/utils/setOps";
  import { hasAncestor } from "~/utils/hasAncestor";
  import { mouse } from "~/stores/mouse";
  import { globalEvents } from "~/events";
  import { mode } from "~/stores/mode";
  import * as selectionLogic from "./selectionLogic";

  import { IntersectionFinder } from "./IntersectionFinder";

  import { worldManager as wm } from "~/stores/worldManager";
  import { TouchController } from "~/ecs/plugins/player-control";
  import { PointerPlane, PointerPlaneRef } from "~/ecs/plugins/pointer-plane";
  import { Transform } from "hecs-plugin-core";
  import { uuidv4 } from "~/utils/uuid";

  export let world;

  const DRAG_DISTANCE_THRESHOLD = 15;
  const mousePosition = new Vector2();
  const mouseStartPosition = new Vector2();
  let mouseMode: "initial" | "click" | "drag" = "initial";
  let pointerPlaneEntity;
  let dragOffset;

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
    if ($wm.avatar.has(TouchController)) {
      $wm.avatar.remove(TouchController);
    }
  }

  function onMousemove(event: MouseEvent) {
    if (!eventTargetsWorld(event)) return;

    globalEvents.emit("mouseActivity");

    setMousePositionFromEvent(event);

    const found = findIntersectionsAtMousePosition();
    mouse.set(finder._normalizedCoords);

    if (mouseMode === "click") {
      if (
        mousePosition.distanceTo(mouseStartPosition) <= DRAG_DISTANCE_THRESHOLD
      ) {
        const foundSet: Set<string> = new Set(found);

        const added = difference(foundSet, $hovered);
        const deleted = difference($hovered, foundSet);

        // Keep svelte `hovered` store up to date based on mouse movements
        for (const entityId of added) hovered.add(entityId);
        for (const entityId of deleted) hovered.delete(entityId);
      } else if ($wm.selection.length > 0) {
        // drag  mode start
        mouseMode = "drag";
        dragOffset = null;
        pointerPlaneEntity = world.entities
          .create("MouseDragPointerPlane", uuidv4())
          .add(Transform, { position: $wm.selection.centroid })
          .add(PointerPlane)
          .activate();
      }
    } else if (mouseMode === "drag") {
      const ref = pointerPlaneEntity.get(PointerPlaneRef);
      if (ref) {
        if (!dragOffset && (ref.XZ.x !== 0 || ref.XZ.z !== 0)) {
          $wm.selection.savePositions();
          dragOffset = new Vector3().copy(ref.XZ);
          // console.log("set dragOffset", dragOffset);
        }
        if (dragOffset) {
          const position = new Vector3().copy(ref.XZ);
          position.x -= dragOffset.x;
          position.z -= dragOffset.z;
          $wm.selection.moveRelativeToSavedPositions(position);
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

      selectionLogic.mousedown(found, event.shiftKey);
    } else if ($mode === "play") {
      if (found.includes($wm.avatar.id)) {
        $wm.avatar.add(TouchController);
      }
    }
  }

  function onMouseup(event: MouseEvent) {
    if (!eventTargetsWorld(event)) return;

    if ($mode === "build") {
      if (mouseMode === "click") {
        selectionLogic.mouseup();
      } else if (mouseMode === "drag") {
        $wm.selection.syncEntities();
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
      if (found.includes($wm.avatar.id)) {
        $wm.avatar.add(TouchController);
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
