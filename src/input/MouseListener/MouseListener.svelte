<script lang="ts">
  import { IntersectionFinder } from "./IntersectionFinder";
  import { hovered, selected } from "~/world/selection";
  import { difference, intersection } from "~/utils/setOps";

  type EntityId = string;

  export let world;

  let previousClickSet: Set<EntityId> = new Set();
  let previousClickIndex: number = 0;

  const finder = new IntersectionFinder(
    world.presentation.camera,
    world.presentation.scene
  );

  function findFromMouseEvent(event) {
    const coords = { x: event.offsetX, y: event.offsetY };
    return [...finder.find(coords)].map((object) => object.userData.entityId);
  }

  function onMousemove(event) {
    const found = findFromMouseEvent(event);
    const foundSet: Set<string> = new Set(found);

    const added = difference(foundSet, $hovered);
    const removed = difference($hovered, foundSet);

    for (const entityId of added) {
      hovered.update(($hovered) => {
        $hovered.add(entityId);
        return $hovered;
      });
    }

    for (const entityId of removed) {
      hovered.update(($hovered) => {
        $hovered.delete(entityId);
        return $hovered;
      });
    }
  }

  function onMousedown(event) {
    const found = findFromMouseEvent(event);
    const foundSet: Set<string> = new Set(found);

    if (found.length === 0) {
      selected.update(($selected) => {
        $selected.clear();
        return $selected;
      });
    } else if (found.length === 1) {
      // User is clicking on only one possible entity

      const entityId: string = found[0];
      selected.update(($selected) => {
        if ($selected.has(entityId)) {
          if (event.shiftKey) {
            // Shift-click on just one already-selected entity
            // removes that entity ONLY from the selection
            $selected.delete(entityId);
          } else {
            // Regular-click on just one already-selected entity
            // removes it and everything else
            $selected.clear();
          }
        } else {
          if (event.shiftKey) {
            // Shift-click on just one unselected entity adds it
            // to the selection
            $selected.add(entityId);
          } else {
            // Regular-click on just one unselected entity adds
            // that entity ONLY to the selection
            $selected.clear();
            $selected.add(entityId);
          }
        }
        return $selected;
      });
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
      while (previousClickIndex < found.length) {
        const entityId = found[previousClickIndex++];
        if (!$selected.has(entityId)) {
          selected.update(($selected) => {
            if (!event.shiftKey) {
              $selected.clear();
            }
            $selected.add(entityId);
            return $selected;
          });
          // Add only one at a time to selection
          break;
        }
      }
    }

    previousClickSet = foundSet;
  }
</script>

<svelte:window on:mousemove={onMousemove} on:mousedown={onMousedown} />
