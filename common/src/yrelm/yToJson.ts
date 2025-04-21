import type * as Y from "yjs"

import type { YEntity, YMeta, YChildren, YComponents, YComponent, YValues } from "./types.js"

export function yEntityToJSON(yentity: YEntity) {
  return {
    id: yentity.get("id") as string,
    name: yentity.get("name") as string,
    parent: yentity.get("parent") as string,
    children: (yentity.get("children") as YChildren).toJSON(),
    meta: (yentity.get("meta") as YMeta).toJSON(),
    ...yComponentsToJSON(yentity.get("components") as YComponents),
  }
}

export function yComponentsToJSON(ycomponents: YComponents) {
  const json = {}
  for (const ycomponent of ycomponents) {
    for (const [key, value] of Object.entries(yComponentToJSON(ycomponent))) {
      json[key] = value
    }
  }
  return json
}

export function yComponentToJSON(ycomponent: YComponent) {
  const name = ycomponent.get("name") as string
  const yvalues: YValues = ycomponent.get("values") as YValues
  return {
    [name]: yvalues.toJSON(),
  }
}

// Get the "delta" on a Y.Text object; inverse of deltaToYText
export function yTextToDelta(ytext: Y.Text) {
  return ytext.toDelta()
}
