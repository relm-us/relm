import { Color, Vector3 } from "three";

import { Transform } from "~/ecs/plugins/core";
import { RigidBody, Collider } from "~/ecs/plugins/physics";
import { Shape } from "~/ecs/plugins/shape";
import { NonInteractive } from "~/ecs/plugins/non-interactive";

import { GROUND_INTERACTION } from "~/config/colliderInteractions";

import { makeEntity } from "./makeEntity";

export function makeGround(world, { x = 0, y = 0, z = 0, h = 1 }) {
  const color = new Color("#55814e");

  return makeEntity(world, "Ground")
    .add(Transform, { position: new Vector3(x, y - h / 2, z) })
    .add(Shape, {
      color: "#" + color.getHexString(),
      kind: "CYLINDER",
      cylinderRadius: 15,
      cylinderHeight: h,
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
      cylinderHeight: h,
      interaction: GROUND_INTERACTION,
    })
    .add(NonInteractive);
}
