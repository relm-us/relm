<script lang="ts">
  import { hovered } from "~/stores/selection";
  import { Vector2 } from "three";
  import { difference, intersection } from "~/utils/setOps";
  import { hasAncestor } from "~/utils/hasAncestor";
  import { mouse } from "~/stores/mouse";
  import { globalEvents } from "~/events";
  import { mode } from "~/stores/mode";
  import * as selectionLogic from "./selectionLogic";

  import { IntersectionFinder } from "./IntersectionFinder";

  import { worldManager } from "~/stores/worldManager";
  import { TouchController } from "~/ecs/plugins/player-control";

  export let world;

  let mousePosition = new Vector2();

  const finder = new IntersectionFinder(
    world.presentation.camera,
    world.presentation.scene
  );

  function setMousePositionFromEvent(event) {
    mousePosition.set(event.clientX, event.clientY);
  }

  function findIntersectionsAtMousePosition() {
    finder.castRay(mousePosition);
    return [...finder.find()].map((object) => object.userData.entityId);
  }

  function eventTargetsWorld(event) {
    return hasAncestor(event.target, world.presentation.viewport);
  }

  function removeTouchController() {
    if ($worldManager.avatar.has(TouchController)) {
      $worldManager.avatar.remove(TouchController);
    }
  }

  function onMousemove(event: MouseEvent) {
    if (!eventTargetsWorld(event)) return;

    globalEvents.emit("mouseActivity");

    setMousePositionFromEvent(event);

    const found = findIntersectionsAtMousePosition();
    mouse.set(finder._normalizedCoords);
    const foundSet: Set<string> = new Set(found);

    const added = difference(foundSet, $hovered);
    const deleted = difference($hovered, foundSet);

    // Keep svelte `hovered` store up to date based on mouse movements
    for (const entityId of added) hovered.add(entityId);
    for (const entityId of deleted) hovered.delete(entityId);
  }

  /**
   * Track mouse click events in connection with the object selection system
   *
   * @param event
   */
  function onMousedown(event: MouseEvent) {
    if (!eventTargetsWorld(event)) return;

    setMousePositionFromEvent(event);

    const found = findIntersectionsAtMousePosition();

    if ($mode === "build") {
      selectionLogic.mousedown(found, event.shiftKey);
    } else if ($mode === "play") {
      if (found.includes($worldManager.avatar.id)) {
        $worldManager.avatar.add(TouchController);
      }
    }
  }

  function onMouseup(event: MouseEvent) {
    if ($mode === "build") {
      selectionLogic.mouseup();
    } else if ($mode === "play") {
      removeTouchController();
    }
  }

  function onTouchStart(event: TouchEvent) {
    event.preventDefault();
    var touches = event.changedTouches;

    mousePosition.set(touches[0].clientX, touches[0].clientY);

    const found = findIntersectionsAtMousePosition();

    if ($mode === "build") {
      selectionLogic.mousedown(found, false);
    } else if ($mode === "play") {
      if (found.includes($worldManager.avatar.id)) {
        $worldManager.avatar.add(TouchController);
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
