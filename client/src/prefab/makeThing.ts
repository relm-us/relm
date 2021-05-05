import { Transform, Asset } from "~/ecs/plugins/core";

import { Vector3 } from "three";

import { RigidBody, Collider } from "~/ecs/plugins/physics";
import { Model } from "~/ecs/plugins/model";

import { makeEntity } from "./makeEntity";

export function makeThing(
  world,
  { x, y = 0.5, z, w = 1, h = 1, d = 1, yOffset = 0, dynamic = false, url }
) {
  const thing = makeEntity(world, "Thing")
    .add(Transform, {
      // Put it in the corner
      position: new Vector3(x, y + yOffset, z),
      scale: new Vector3(w, h, d),
    })
    .add(Model, {
      asset: new Asset(url),
    })
    .add(RigidBody, {
      kind: dynamic ? "DYNAMIC" : "STATIC",
    })
    .add(Collider, {
      kind: "BOX",
      boxSize: new Vector3(w, h, d),
    });
  return thing;
}
