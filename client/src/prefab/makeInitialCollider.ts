import { Vector3 } from "three";

import { Transform } from "~/ecs/plugins/core";
import { RigidBody, Collider } from "~/ecs/plugins/physics";
import { NonInteractive } from "~/ecs/plugins/non-interactive";

import { GROUND_INTERACTION } from "~/config/colliderInteractions";

import { makeEntity } from "./makeEntity";

export function makeInitialCollider(world) {
  return makeEntity(world, "InitialCollider")
    .add(Transform, { position: new Vector3(0, -0.5, 0) })
    .add(RigidBody, {
      kind: "STATIC",
    })
    .add(Collider, {
      shape: "CYLINDER",
      cylinderRadius: 2,
      cylinderHeight: 1,
      interaction: GROUND_INTERACTION,
    })
    .add(NonInteractive);
}
