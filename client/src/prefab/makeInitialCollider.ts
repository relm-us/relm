import { makeEntity } from "./makeEntity";
import { Transform } from "~/ecs/plugins/core";
import { RigidBody, Collider } from "~/ecs/plugins/rapier";
import { InvisibleToMouse } from "~/ecs/components/InvisibleToMouse";
import { Vector3 } from "three";

const groundSize = {
  w: 1000,
  h: 100,
  d: 100,
};

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
      interaction: 0x00010003,
    })
    .add(InvisibleToMouse);
}
