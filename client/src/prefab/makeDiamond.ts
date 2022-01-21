import { Vector3 } from "three";

import { makeEntity } from "./makeEntity";

import { Transform } from "~/ecs/plugins/core";
import { Diamond } from "~/ecs/plugins/diamond";
import { Clickable } from "~/ecs/plugins/clickable";

export function makeDiamond(world, { x = 0, y = 0, z = 0 }) {
  const diamond = makeEntity(world, "Diamond")
    .add(Transform, { position: new Vector3(x, y + 0.5, z) })
    .add(Clickable)
    .add(Diamond);

  return diamond;
}
