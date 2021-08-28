import { Color, Vector3 } from "three";

import { makeEntity } from "./makeEntity";

import { Transform } from "~/ecs/plugins/core";
import { Html2d } from "~/ecs/plugins/html2d";
import { Diamond } from "~/ecs/plugins/diamond";

export function makeDiamond(
  world,
  { x = 0, y = 0, z = 0, yOffset = 1, content = "Hello" }
) {
  const linearColor = new Color("#BBFF00");
  linearColor.convertSRGBToLinear();

  const diamond = makeEntity(world, "Diamond")
    .add(Transform, {
      position: new Vector3(x, y + yOffset, z),
    })
    .add(Html2d, {
      kind: "LABEL",
      content,
      offset: new Vector3(0, -0.6, 0),
      hanchor: 0,
      vanchor: 0,
      draggable: true,
    })
    .add(Diamond);

  const message = makeEntity(world, "Message")
    .add(Transform, {
      position: new Vector3(),
    })
    .add(Html2d, {
      kind: "LABEL",
      content: "",
      offset: new Vector3(0, 0.6, 0),
      hanchor: 0,
      vanchor: 0,
      editable: true,
      draggable: false,
    });

  message.setParent(diamond);

  return diamond;
}
