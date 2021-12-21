import { Vector3 } from "three";

import { makeEntity } from "./makeEntity";

import { Transform } from "~/ecs/plugins/core";
import { Diamond } from "~/ecs/plugins/diamond";
import { Clickable } from "~/ecs/plugins/clickable";

export function makeDiamond(world, { x = 0, y = 0, z = 0, yOffset = 1 }) {
  // TODO: Why do we need to at 2 units to `y` value to get it above ground??
  const diamond = makeEntity(world, "Diamond")
    .add(Transform, {
      position: new Vector3(x, y + yOffset + 2, z),
    })
    .add(Clickable)
    .add(Diamond);

  return diamond;
}
