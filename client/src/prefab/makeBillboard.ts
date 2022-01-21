import { Transform } from "~/ecs/plugins/core";
import { Vector2, Vector3 } from "three";

import { Renderable, CssPlane } from "~/ecs/plugins/css3d";

import { makeEntity } from "./makeEntity";

export function makeBillboard(
  world,
  {
    x = 0,
    y = 0,
    z = 0,
    text,
    editable = false,
    fontSize,
    width = 2,
    height = 1.5,
  }
) {
  const label = makeEntity(world, "Billboard")
    .add(Transform, {
      position: new Vector3(x, y + height/2, z),
    })
    .add(Renderable, {
      kind: "LABEL",
      text,
      editable,
      fontSize,
    })
    .add(CssPlane, {
      kind: "RECTANGLE",
      rectangleSize: new Vector2(width, height),
    });

  return label;
}
