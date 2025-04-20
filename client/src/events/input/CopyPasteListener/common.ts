import { Vector3 } from "three"
import { nanoid } from "nanoid"

import type { GroupTree } from "~/stores/selection"
import { Transform } from "~/ecs/plugins/core"

export type CopyBuffer = {
  center: Vector3
  entities: any
  groupTree: GroupTree
}

export function getCenter(entities) {
  const center = new Vector3()
  let count = 0
  for (const entity of entities) {
    const transform = entity.get(Transform)
    if (transform) {
      center.add(transform.position)
      count++
    }
  }
  if (count > 0) {
    center.divideScalar(count)
  }
  return center
}

export function getRootEntities(entities) {
  return entities.filter((entity) => entity.parent === null)
}

export function serializeEntityWithOffset(entity, offset) {
  const transform = entity.get(Transform)
  if (transform) transform.position.sub(offset)
  const json = entity.toJSON()
  if (transform) transform.position.add(offset)
  return json
}

// Given a set of JSON-ified entities, give them all new identifiers.
// Note that entities are organized in a hierarchy and reference each other.
export function assignNewIds(serializedEntities: Array<any>) {
  // map from OLD IDs to NEW IDs
  const idMap = new Map<string, string>()

  // First pass: Assign new IDs
  for (const sEntity of serializedEntities) {
    const newId = nanoid()
    idMap.set(sEntity.id, newId)
    sEntity.id = newId
  }

  // Second pass: Update parent/children references
  for (const sEntity of serializedEntities) {
    if (sEntity.parent) {
      sEntity.parent = idMap.get(sEntity.parent)
    }
    sEntity.children = sEntity.children.map((childId) => {
      return idMap.get(childId)
    })
  }

  return idMap
}

export function assignNewGroupIds(groupTree: GroupTree, idMap: Map<string, string>) {
  // map from OLD IDs to NEW IDs
  const groupIdMap = new Map<string, string>()

  // First: update entity IDs from idMap
  const entities = groupTree.entities
  for (const [oldId, newId] of idMap) {
    const oldGroupId = entities.get(oldId)

    if (oldGroupId) {
      // Get or create a newGroupId
      let newGroupId = groupIdMap.get(oldGroupId)
      if (!newGroupId) {
        newGroupId = nanoid()
        groupIdMap.set(oldGroupId, newGroupId)
      }

      // Update group tree
      entities.set(newId, newGroupId)
      entities.delete(oldId)
    }
  }
}

export function selfWithDescendants(entity) {
  if (entity.children.length > 0) {
    return [entity, ...entity.children]
  } else {
    return [entity]
  }
}

export function serializeCopyBuffer(buffer: CopyBuffer) {
  return JSON.stringify(
    {
      center: buffer.center.toArray(),
      entities: buffer.entities,
      groupTree: {
        entities: Object.fromEntries(buffer.groupTree.entities.entries()),
        groups: Object.fromEntries(buffer.groupTree.groups.entries()),
      },
    },
    null,
    2,
  )
}

export function deserializeCopyBuffer(json: string): CopyBuffer {
  const deserialized = JSON.parse(json)

  return {
    center: new Vector3().fromArray(deserialized.center),
    entities: deserialized.entities,
    groupTree: {
      entities: new Map(Object.entries(deserialized.groupTree.entities)),
      groups: new Map(Object.entries(deserialized.groupTree.groups)),
    },
  }
}
