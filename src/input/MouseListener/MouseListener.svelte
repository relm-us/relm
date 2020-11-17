<script lang="ts">
  import {
    hovered,
    selectedEntities,
    selectedGroups,
    groupTree,
  } from "~/world/selection";
  import { Vector2 } from "three";
  import { difference, intersection } from "~/utils/setOps";
  import { hasAncestor } from "~/utils/hasAncestor";
  import { mouse } from "~/world/mouse";

  import { IntersectionFinder } from "./IntersectionFinder";

  export let world;

  type EntityId = string;

  let previousClickSet: Set<EntityId> = new Set();
  let previousClickIndex: number = 0;
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

  function maybeSelectGroupContainingEntity(entityId) {
    const rootGroupId = groupTree.getRoot(entityId);
    if (rootGroupId) {
      selectedGroups.add(rootGroupId);

      const others = groupTree.getEntitiesInGroup(rootGroupId);
      selectedEntities.update(($selected) => {
        for (const otherId of others) {
          $selected.add(otherId);
        }
        return $selected;
      });
    }
  }

  function onMousemove(event: MouseEvent) {
    if (!eventTargetsWorld(event)) return;

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
    const foundSet: Set<string> = new Set(found);

    if (found.length === 0) {
      selectedEntities.clear();
      selectedGroups.clear();
    } else if (found.length === 1) {
      // User is clicking on only one possible entity

      const entityId: string = found[0];
      if (selectedEntities.has(entityId)) {
        if (event.shiftKey) {
          // Shift-click on just one already-selected entity
          // removes ONLY that entity from the selection
          selectedEntities.delete(entityId);
        } else {
          // Regular-click on just one already-selected entity
          // removes it and everything else
          selectedEntities.clear();
          selectedGroups.clear();
        }
      } else {
        if (event.shiftKey) {
          // Shift-click on just one unselected entity adds it
          // to the selection
          selectedEntities.add(entityId);
          maybeSelectGroupContainingEntity(entityId);
        } else {
          // Regular-click on just one unselected entity replaces
          // the current selection with ONLY that entity
          selectedEntities.clear();
          selectedEntities.add(entityId);
          maybeSelectGroupContainingEntity(entityId);
        }
      }
    } else if (found.length > 1) {
      // User is clicking on a spot that contains several entities

      if (intersection(previousClickSet, foundSet).size !== foundSet.size) {
        // User is NOT clicking on the same set of entities as they did previously
        previousClickIndex = 0;
      }

      // If we've reached the end of the cycle, start over
      if (previousClickIndex >= found.length) {
        previousClickIndex = 0;
      }

      // Start wherever we were last time
      const entityId = found[previousClickIndex++];
      if (!event.shiftKey) {
        selectedEntities.clear();
        selectedGroups.clear();
      }
      selectedEntities.add(entityId);
      maybeSelectGroupContainingEntity(entityId);
    }

    previousClickSet = foundSet;
  }
</script>

<svelte:window on:mousemove={onMousemove} on:mousedown={onMousedown} />
