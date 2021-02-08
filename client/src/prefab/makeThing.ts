import { Transform, Asset } from "~/ecs/plugins/core";

import { Vector3 } from "three";

import { RigidBody, Collider } from "~/ecs/plugins/rapier";
import { NormalizeMesh } from "~/ecs/plugins/normalize";
import { TransformEffects } from "~/ecs/plugins/transform-effects";
import { Model } from "~/ecs/plugins/three";

import { makeEntity } from "./makeEntity";

export function makeThing(
  world,
  { x, y, z, w = 1, h = 1, d = 1, yOffset = 0, url }
) {
  const thing = makeEntity(world, "Thing")
    .add(NormalizeMesh)
    .add(Transform, {
      // Put it in the corner
      position: new Vector3(x, y, z),
      scale: new Vector3(w, h, d),
    })
    .add(TransformEffects, {
      effects: [
        {
          function: "position",
          params: { position: new Vector3(0, yOffset, 0) },
        },
      ],
    })
    .add(Model, {
      asset: new Asset(url),
    })
    .add(RigidBody, {
      kind: "DYNAMIC",
    })
    .add(Collider, {
      kind: "BOX",
      boxSize: new Vector3(w, h, d),
    });
  return thing;
}
