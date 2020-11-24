import { Transform } from "hecs-plugin-core";
import { Vector3 } from "three";

import { RigidBody, Collider } from "~/ecs/plugins/rapier";

import { makeEntity } from "./makeEntity";

export function makeInvisibleBox(
  world,
  {
    x = 0,
    y = 0,
    z = 0,
    w = 1,
    h = 1,
    d = 1,
    dynamic = true,
    name = "InvisibleBox",
  }
) {
  const entity = makeEntity(world, name)
    .add(Transform, {
      position: new Vector3(x, y, z),
    })
    .add(RigidBody, {
      kind: dynamic ? "DYNAMIC" : "STATIC",
    })
    .add(Collider, {
      kind: "BOX",
      boxSize: new Vector3(w, h, d),
    });
  return entity;
}
