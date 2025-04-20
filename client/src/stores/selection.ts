import { uuidv4 } from "~/utils/uuid"
import { writable, type Writable, get } from "svelte/store"

export type EntityId = string
export type GroupId = string
export type GroupTree = {
  entities: Map<EntityId, GroupId>
  groups: Map<GroupId, GroupId>
}

export function createGroupTree({ entities = new Map(), groups = new Map() } = {}) {
  const tree: GroupTree = {
    entities,
    groups,
  }

  const getGroupRoot = (groupId: GroupId): GroupId | null => {
    while (tree.groups.has(groupId)) {
      groupId = tree.groups.get(groupId)
    }
    return groupId
  }

  const getRoot = (entityId: EntityId): GroupId | null => {
    if (tree.entities.has(entityId)) {
      return getGroupRoot(tree.entities.get(entityId))
    }

    return null
  }

  const getEntitiesInGroup = (groupId: GroupId): Set<EntityId> => {
    const subgroups = new Set([groupId])
    let prevSize = -1
    // Iterate until set stops growing
    while (prevSize !== subgroups.size) {
      for (const [childId, parentId] of tree.groups) {
        if (groupId === parentId) {
          subgroups.add(childId)
        }
      }
      prevSize = subgroups.size
    }

    // Return "leaf nodes", which are entity IDs
    const entityIds: Set<EntityId> = new Set()
    for (const [entityId, parentGroupId] of tree.entities) {
      if (subgroups.has(parentGroupId)) {
        entityIds.add(entityId)
      }
    }

    return entityIds
  }

  const addEntity = (entityId, groupId) => {
    tree.entities.set(entityId, groupId)
  }

  const addGroup = (childGroupId, parentGroupId) => {
    tree.groups.set(childGroupId, parentGroupId)
  }

  function makeGroup(entityIds, groupId = uuidv4()) {
    for (const entityId of entityIds) {
      tree.entities.set(entityId, groupId)
    }
    return groupId
  }

  function unmakeGroup(groupId) {
    for (const [entityId, parentGroupId] of tree.entities) {
      if (groupId === parentGroupId) {
        tree.entities.delete(entityId)
      }
    }
  }

  function cloneTree(): GroupTree {
    return { entities: new Map(tree.entities), groups: new Map(tree.groups) }
  }

  function mergeTree(newTree: GroupTree) {
    for (const [entityId, parentGroupId] of newTree.entities) {
      tree.entities.set(entityId, parentGroupId)
    }
  }

  return {
    tree,
    getEntitiesInGroup,
    getRoot,
    addEntity,
    addGroup,
    makeGroup,
    unmakeGroup,
    cloneTree,
    mergeTree,
  }
}

function createSetStore<T>() {
  const store: Writable<Set<T>> = writable(new Set())
  const { subscribe, update } = store

  const methods = {
    has: (value) => {
      return get(store).has(value)
    },

    get: () => {
      return get(store)
    },

    getSize: () => {
      return get(store).size
    },

    add: (value) => {
      update(($set) => {
        $set.add(value)
        return $set
      })
    },

    delete: (value) => {
      update(($set) => {
        $set.delete(value)
        return $set
      })
    },

    clear: () => {
      update(($set) => {
        $set.clear()
        return $set
      })
    },

    copy: (otherSetStore) => {
      update(($set) => {
        $set.clear()
        for (const value of otherSetStore.get()) {
          $set.add(value)
        }
        return $set
      })
    },
  }

  return {
    subscribe,
    update,
    ...methods,
  }
}

// Stores groups & entities in a tree structure. Not a Svelte store.
export const groupTree = createGroupTree()

// Stores containing Set information, e.g. if an entity is selected, it is in the 'set'.
export const selectedEntities = createSetStore<string>()
export const selectedGroups = createSetStore<string>()
