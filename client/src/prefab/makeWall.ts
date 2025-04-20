import { Transform } from "~/ecs/plugins/core"
import { Color, Vector3 } from "three"

import { makeEntity } from "./makeEntity"
import { Wall } from "~/ecs/plugins/wall"

export function makeWall(
  world,
  {
    x = 0,
    y = 0,
    z = 0,
    w = 2,
    h = 2,
    d = 0.25,
    color = "white",
    name = "Wall",
    metalness = 0.2,
    roughness = 0.8,
    emissive = "#000000",
    segments = 5,
    convexity = 0,
  },
) {
  const linearColor = new Color(color)
  // linearColor.convertSRGBToLinear();

  const entity = makeEntity(world, name)
    .add(Transform, { position: new Vector3(x, y, z) })
    .add(Wall, {
      color: "#" + linearColor.getHexString(),
      size: new Vector3(w, h, d),
      metalness,
      roughness,
      emissive,
      segments,
      convexity,
    })

  return entity
}
