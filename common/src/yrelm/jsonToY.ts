import * as Y from "yjs"

import type { YEntity, YMeta, YChildren, YComponents, YComponent, YValues } from "./types.js"

import { isEntityAttribute } from "./utils.js"

/**
 * Create a new YEntity and subtree from a HECS entity's JSON-export.
 *
 * @param entity the HECS entity's data (i.e. entity.toJSON())
 */
export function jsonToYEntity(data): YEntity {
  const yentity: YEntity = new Y.Map()

  yentity.set("id", data.id)
  yentity.set("name", data.name)
  yentity.set("parent", data.parent)

  yentity.set("children", jsonToYChildren(data.children))

  yentity.set("meta", jsonToYMeta(data.meta))

  yentity.set("components", jsonToYComponents(data))

  return yentity
}

export function jsonToYChildren(data: Array<string>): YChildren {
  const ychildren: YChildren = new Y.Array()
  ychildren.push(data)
  return ychildren
}

export function jsonToYMeta(data: object): YMeta {
  const ymeta: YMeta = new Y.Map()
  for (const key in data) {
    ymeta.set(key, data[key])
  }
  return ymeta
}

export function jsonToYComponents(data: object): YComponents {
  const ycomponents: YComponents = new Y.Array()

  const ycomponentList: Array<YComponent> = []
  for (const key in data) {
    if (isEntityAttribute(key)) continue

    const ycomponent = jsonToYComponent(key, data[key])

    ycomponentList.push(ycomponent)
  }
  ycomponents.push(ycomponentList)

  return ycomponents
}

export function jsonToYComponent(name: string, data: object): YComponent {
  const ycomponent: YComponent = new Y.Map()

  ycomponent.set("name", name)
  ycomponent.set("values", jsonToYValues(data))

  return ycomponent
}

export function jsonToYValues(data: object): YValues {
  const yvalues: YValues = new Y.Map()

  for (const key in data) {
    yvalues.set(key, data[key])
  }

  return yvalues
}

// Convert a quill/yjs-based JSON "delta" to a Y.Text object. Inverse of yTextToDelta.
export function deltaToYText(delta: any): Y.Text {
  const ytext: Y.Text = new Y.Text()

  ytext.applyDelta(delta)

  return ytext
}
