import { Color, Vector3 } from "three";

import { makeEntity } from "./makeEntity";

import { Transform } from "~/ecs/plugins/core";
import { Html2d } from "~/ecs/plugins/html2d";
import { Shape } from "~/ecs/plugins/shape";

export function makeLabel(
  world,
  { x = 0, y = 0.5, z = 0, yOffset = 0, content = "Hello" }
) {
  const linearColor = new Color("#BBFF00");
  linearColor.convertSRGBToLinear();

  return makeEntity(world, "Label")
    .add(Transform, {
      position: new Vector3(x, y + yOffset, z),
    })
    .add(Html2d, {
      kind: "LABEL",
      content,
      offset: new Vector3(0.1, 0, 0),
      hanchor: 1,
      draggable: true,
    })
    .add(Shape, {
      kind: "SPHERE",
      color: "#" + linearColor.getHexString(),
      sphereRadius: 0.1,
    });
}
