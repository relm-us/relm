import { Color, Vector3 } from "three";

import { Transform } from "~/ecs/plugins/core";
import { RigidBody, Collider } from "~/ecs/plugins/rapier";
import { Shape } from "~/ecs/plugins/shape";

import { GROUND_INTERACTION } from "~/config/colliderInteractions";

import { makeEntity } from "./makeEntity";

export function makeGround(world, { x = 0, y = 0, z = 0, yOffset = -0.5 }) {
  const color = new Color("#55814e");

  return makeEntity(world, "Ground")
    .add(Transform, { position: new Vector3(x, y + yOffset, z) })
    .add(Shape, {
      color: "#" + color.getHexString(),
      kind: "CYLINDER",
      cylinderRadius: 15,
      cylinderHeight: 1,
      cylinderSegments: 60,
      metalness: 0.2,
      roughness: 0.8,
      emissive: "#000000",
    })
    .add(RigidBody, {
      kind: "STATIC",
    })
    .add(Collider, {
      shape: "CYLINDER",
      cylinderRadius: 15,
      cylinderHeight: 1,
      interaction: GROUND_INTERACTION,
    });
}
