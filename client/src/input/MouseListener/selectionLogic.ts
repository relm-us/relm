import { Vector2, Vector3, Box2} from 'three'
import { SelectionManager } from "~/world/SelectionManager";
import { groupTree } from "~/stores/selection";
import { intersection } from "~/utils/setOps";

type EntityId = string;

let previousClickSet: Set<EntityId> = new Set();
let previousClickIndex: number = 0;

let found: Array<string>;
let shiftKey: boolean;

let mp = new Vector3();
let msp = new Vector3();
export function getSelectionBox(world, p1: Vector2, p2: Vector2, target: Box2) {
  world.presentation.getWorldFromScreenCoords(p1.x, p1.y, mp);
  world.presentation.getWorldFromScreenCoords(p2.x, p2.y, msp);
  // note: switching from 3D XZ plane to 2D XY plane
  target.min.x = Math.min(mp.x, msp.x);
  target.min.y = Math.min(mp.z, msp.z);
  // note: switching from 3D XZ plane to 2D XY plane
  target.max.x = Math.max(mp.x, msp.x);
  target.max.y = Math.max(mp.z, msp.z);
}

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
  const foundSet: Set<string> = new Set(found);

  if (found.length === 0) {
    selection.clear(true);
  } else if (found.length === 1) {
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
