import { get } from "svelte/store";
import { Relm } from "~/stores/Relm";
import { mode } from "~/stores/mode";
import { selectedEntities } from "~/stores/selection";
import { copyBuffer } from "~/stores/copyBuffer";
import { Transform } from "~/ecs/plugins/core";
import { Vector3 } from "three";
import { nanoid } from "nanoid";

function getCenter(entities) {
  const center = new Vector3();
  let count = 0;
  for (const entity of entities) {
    const transform = entity.get(Transform);
    if (transform) {
      center.add(transform.position);
      count++;
    }
  }
  if (count > 0) {
    center.divideScalar(count);
  }
  return center;
}

function getRootEntities(entities) {
  return entities.filter((entity) => entity.parent === null);
}

function serializeEntityWithOffset(entity, offset) {
  const transform = entity.get(Transform);
  if (transform) transform.position.sub(offset);
  const json = entity.toJSON();
  if (transform) transform.position.add(offset);
  return json;
}

// Given a set of JSON-ified entities, give them all new identifiers.
// Note that entities are organized in a hierarchy and reference each other.
function assignNewIds(serializedEntities) {
  // map from OLD IDs to NEW IDs
  const idMap = new Map();

  // First pass: Assign new IDs
  for (const sEntity of serializedEntities) {
    const newId = nanoid();
    idMap.set(sEntity.id, newId);
    sEntity.id = newId;
  }

  // Second pass: Update parent/children references
  for (const sEntity of serializedEntities) {
    if (sEntity.parent) {
      sEntity.parent = idMap.get(sEntity.parent);
    }
    sEntity.children = sEntity.children.map((childId) => {
      return idMap.get(childId);
    });
  }
}

function selfWithDescendants(entity) {
  if (entity.children.length > 0) {
    return [entity, ...entity.children];
  } else {
    return [entity];
  }
}

export function onCopy() {
  if (get(mode) === "build") {
    const selectedIds = selectedEntities.get();
    if (selectedIds.size > 0) {
      const $Relm = get(Relm);

      const entities = [...selectedIds].map((id) =>
        $Relm.world.entities.getById(id)
      );

      // expand selection to include children
      const entitiesWithDescendants = [].concat.apply(
        [],
        entities.map(selfWithDescendants)
      );

      const roots = getRootEntities(entitiesWithDescendants);
      const center = getCenter(roots);

      const serialized = entitiesWithDescendants.map((entity) => {
        if (roots.includes(entity)) {
          return serializeEntityWithOffset(entity, center);
        } else {
          return entity.toJSON();
        }
      });

      copyBuffer.set({
        center,
        entities: serialized,
      });
    } else {
      console.warn("Nothing copied (nothing selected)");
    }
  } else {
    console.warn("Nothing copied (play mode)");
  }
}

export function onPaste() {
  const offset = new Vector3();
  if (get(mode) === "build") {
    const buffer = get(copyBuffer);
    if (buffer.entities.length > 0) {
      // Entities in copy buffer get new IDs on every paste
      assignNewIds(buffer.entities);

      const $Relm = get(Relm);

      const targetPosition = new Vector3().copy(
        $Relm.avatar.get(Transform).position
      );
      targetPosition.y = buffer.center.y;

      const entities = [];

      for (const json of buffer.entities) {
        const entity = $Relm.world.entities.create().fromJSON(json).activate();
        const transform = entity.get(Transform);
        if (transform && entity.parent === null) {
          offset.copy(transform.position);
          transform.position.copy(targetPosition).add(offset);
        }
        entities.push(entity);
      }
      for (const entity of entities) {
        entity.bind();
        $Relm.wdoc.syncFrom(entity);
      }
    } else {
      console.warn("Nothing pasted (nothing in copy buffer)");
    }
  } else {
    console.warn("Nothing pasted (play mode)");
  }
}
