import { Transform, Asset } from "~/ecs/plugins/core"

import { Vector3 } from "three"

import { Collider3 } from "~/ecs/plugins/collider"
import { Model3 } from "~/ecs/plugins/model"

import { makeEntity } from "./makeEntity"

export function makeThing(world, { x, y = 0.5, z, w = 1, h = 1, d = 1, yOffset = 0, dynamic = false, url }) {
  const thing = makeEntity(world, "Thing")
    .add(Transform, {
      // Put it in the corner
      position: new Vector3(x, y + yOffset, z),
      scale: new Vector3(w, h, d),
    })
    .add(Model3, { asset: new Asset(url) })
    .add(Collider3, {
      size: new Vector3(w, h, d),
      kind: dynamic ? "DYNAMIC" : "BARRIER",
    })
  return thing
}
