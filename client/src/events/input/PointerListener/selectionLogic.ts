import { get } from "svelte/store";

import { SelectionManager } from "~/world/SelectionManager";
import { intersection } from "~/utils/setOps";
import { BASE_LAYER_ID } from "~/config/constants";

import { groupTree } from "~/stores/selection";
import { layerActive } from "~/stores/layerActive";

type EntityId = string;

let previousClickSet: Set<EntityId> = new Set();
let previousClickIndex: number = 0;

let found: Array<string>;
let shiftKey: boolean;

function maybeSelectGroupContainingEntity(
  entityId,
  selection: SelectionManager
) {
  const rootGroupId = groupTree.getRoot(entityId);
  if (rootGroupId) {
    selection.addGroupId(rootGroupId);

    const others = groupTree.getEntitiesInGroup(rootGroupId);
    for (const otherId of others) {
      selection.addEntityId(otherId);
    }
  }
}

export function mouseup(selection: SelectionManager) {
  if (!found) return;

  const activeLayerId = get(layerActive);
  const foundSet: Set<string> = new Set(
    found.filter((entityId) => {
      const entity = selection.worldManager.world.entities.getById(entityId);
      return (
        activeLayerId === BASE_LAYER_ID || entity.meta.layerId === activeLayerId
      );
    })
  );

  if (foundSet.size === 0) {
    selection.clear(true);
  } else if (foundSet.size === 1) {
    // User is clicking on only one possible entity

    const entityId: string = found[0];
    if (selection.hasEntityId(entityId)) {
      if (shiftKey) {
        // Shift-click on just one already-selected entity
        // removes ONLY that entity from the selection
        selection.deleteEntityId(entityId);
      } else {
        // Regular-click on just one already-selected entity
        // removes it and everything else
        selection.clear(true);
      }
    } else {
      if (shiftKey) {
        // Shift-click on just one unselected entity adds it
        // to the selection
        selection.addEntityId(entityId);
        maybeSelectGroupContainingEntity(entityId, selection);
      } else {
        // Regular-click on just one unselected entity replaces
        // the current selection with ONLY that entity
        selection.clear();
        selection.addEntityId(entityId);
        maybeSelectGroupContainingEntity(entityId, selection);
      }
    }
  } else if (foundSet.size > 1) {
    // User is clicking on a spot that contains several entities

    if (intersection(previousClickSet, foundSet).size !== foundSet.size) {
      // User is NOT clicking on the same set of entities as they did previously
      previousClickIndex = 0;
    }

    // If we've reached the end of the cycle, start over
    if (previousClickIndex >= foundSet.size) {
      previousClickIndex = 0;
    }

    // Start wherever we were last time
    const entityId = found[previousClickIndex++];
    if (!shiftKey) {
      selection.clear(true);
    }
    selection.addEntityId(entityId);
    maybeSelectGroupContainingEntity(entityId, selection);
  }

  previousClickSet = foundSet;
}

export function mousedown(
  foundOnMousedown: Array<string>,
  shiftKeyOnMousedown: boolean
) {
  found = foundOnMousedown;
  shiftKey = shiftKeyOnMousedown;
}
