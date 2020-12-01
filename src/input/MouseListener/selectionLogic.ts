import {
  selectedEntities,
  selectedGroups,
  groupTree,
} from "~/stores/selection";
import { intersection } from "~/utils/setOps";

type EntityId = string;

let previousClickSet: Set<EntityId> = new Set();
let previousClickIndex: number = 0;

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

export function mousedown(found, shiftKey) {
  const foundSet: Set<string> = new Set(found);

  if (found.length === 0) {
    selectedEntities.clear();
    selectedGroups.clear();
  } else if (found.length === 1) {
    // User is clicking on only one possible entity

    const entityId: string = found[0];
    if (selectedEntities.has(entityId)) {
      if (shiftKey) {
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
      if (shiftKey) {
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
    if (!shiftKey) {
      selectedEntities.clear();
      selectedGroups.clear();
    }
    selectedEntities.add(entityId);
    maybeSelectGroupContainingEntity(entityId);
  }

  previousClickSet = foundSet;
}
