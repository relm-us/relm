import { Transform, Asset } from "~/ecs/plugins/core"

import { Vector2, Vector3, Quaternion, Euler } from "three"

import { makeEntity } from "./makeEntity"

import { CssPlane, HdImage } from "~/ecs/plugins/css3d"
import { Draggable } from "~/ecs/plugins/clickable"

export function makeHDImage(
  world,
  { x, y, z, w = 3, h = 2, d = 0.1, xa = 0, ya = -Math.PI / 16, za = 0, url = "", collide = false },
) {
  const thing = makeEntity(world, "Image")
    .add(Transform, {
      position: new Vector3(x, y + h / 2, z),
      rotation: new Quaternion().setFromEuler(new Euler(xa, ya, za)),
    })
    .add(CssPlane, {
      circleRadius: 0.075,
      rectangleSize: new Vector2(w, h),
    })
    .add(Draggable)
    .add(HdImage, {
      asset: new Asset(url),
    })

  return thing
}
