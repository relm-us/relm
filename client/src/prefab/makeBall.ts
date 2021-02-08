import { Transform } from "~/ecs/plugins/core";

import { Color, Vector3 } from "three";

import { BetterShape } from "~/ecs/plugins/better-shape";
import { RigidBody, Collider } from "~/ecs/plugins/rapier";

import { makeEntity } from "./makeEntity";

export function makeBall(
  world,
  {
    name = "Ball",
    x = 0,
    y = 0,
    z = 0,
    r = 0.5,
    color = "red",
    dynamic = true,
    linearDamping = 0,
    angularDamping = 0,
    mass = 0,
    density = 0.4,
    metalness = 0.2,
    roughness = 0.8,
    emissive = "#000000",
    collider = true,
  }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();

  const entity = makeEntity(world, name)
    .add(Transform, {
      position: new Vector3(x, y, z),
    })
    .add(BetterShape, {
      kind: "SPHERE",
      color: "#" + linearColor.getHexString(),
      sphereRadius: r,
      metalness,
      roughness,
      emissive,
    });

  // Optionally add a collider that matches the dimensions of the visible shape
  if (collider) {
    entity
      .add(RigidBody, {
        kind: dynamic ? "DYNAMIC" : "STATIC",
        linearDamping,
        angularDamping,
        mass,
      })
      .add(Collider, {
        shape: "SPHERE",
        sphereRadius: r,
        density,
      });
  }
  return entity;
}
