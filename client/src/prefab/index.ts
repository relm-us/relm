import { get } from "svelte/store"

// Regular construction set
import { makeBall } from "./makeBall"
import { makeBox } from "./makeBox"
import { makeDiamond } from "./makeDiamond"
import { makeRock } from "./makeRock"
import { makeStickyNote } from "./makeStickyNote"
import { makeTv } from "./makeTv"
import { makeWebBox } from "./makeWebBox"
import { makeWhiteboard } from "./makeWhiteboard"

import { worldManager } from "~/world"
import { layerActive } from "~/stores/layerActive"
import { BASE_LAYER_ID } from "~/config/constants"

export const directory = [
  { name: "Ball", make: makeBall },
  { name: "Box", make: makeBox },
  { name: "Diamond", make: makeDiamond },
  { name: "Rock", make: makeRock },
  { name: "Sticky Note", make: makeStickyNote },
  { name: "Whiteboard", make: makeWhiteboard },
  { name: "Web Page", make: makeWebBox },
  { name: "Television", make: makeTv },
]

function activate(entity) {
  const activeLayerId = get(layerActive)
  if (activeLayerId !== BASE_LAYER_ID) {
    entity.meta.layerId = activeLayerId
  }

  entity.activate()

  worldManager.worldDoc.syncFrom(entity)
  for (const child of entity.getChildren()) {
    activate(child)
  }
}

export function createPrefab(makePrefab, props = {}) {
  const position = worldManager.participants.local.avatar.position
  if (position) {
    let entities = makePrefab(worldManager.world, {
      x: position.x,
      y: position.y,
      z: position.z,
      ...props,
    } as any)
    if (!(entities instanceof Array)) entities = [entities]

    for (const entity of entities) activate(entity)
  } else {
    console.error(`Can't create prefab, avatar not found`)
  }
}

export function createPrefabByName(name, props = {}) {
  const prefab = directory.find((item) => item.name === name)

  if (!prefab) {
    console.error(`Prefab not found: '${name}'`)
  } else {
    createPrefab(prefab.make, props)
  }
}
