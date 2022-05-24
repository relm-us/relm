import { Vector3 } from "three";

import { makeEntity } from "./makeEntity";

import { Transform } from "~/ecs/plugins/core";
import { Diamond } from "~/ecs/plugins/diamond";
import { Clickable } from "~/ecs/plugins/clickable";
import { Html2d } from "~/ecs/plugins/html2d";

export function makeDiamond(world, { x = 0, y = 0, z = 0 }) {
  return makeEntity(world, "Diamond")
    .add(Transform, { position: new Vector3(x, y + 0.5, z) })
    .add(Diamond)
    .add(Clickable)
    .add(Html2d, {
      kind: "INFO",
      vanchor: 2,
      editable: true,
      visible: true,
      zoomInvariant: false,
      offset: new Vector3(0, 0.5, 0),
    });
}
