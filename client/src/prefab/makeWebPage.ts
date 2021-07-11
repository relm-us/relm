import { Transform } from "~/ecs/plugins/core";
import { Vector2, Vector3 } from "three";

import { Renderable, CssPlane } from "~/ecs/plugins/css3d";

import { makeEntity } from "./makeEntity";

export function makeWebPage(
  world,
  { x = 0, y = 0, z = 0, yOffset = 0, url, width = 3, height = 2 }
) {
  // Web Page
  const page = makeEntity(world, "Web Page")
    .add(Transform, {
      position: new Vector3(x, y + yOffset, z),
    })
    .add(Renderable, {
      kind: "WEB_PAGE",
      url,
    })
    .add(CssPlane, {
      kind: "RECTANGLE",
      rectangleSize: new Vector2(width, height),
    });
  return page;
}
