import { Transform } from "~/ecs/plugins/core";
import { Color, Vector3 } from "three";

import { BetterShape } from "~/ecs/plugins/better-shape";
import { RigidBody, Collider } from "~/ecs/plugins/rapier";

import { makeEntity } from "./makeEntity";

export function makeBox(
  world,
  {
    x = 0,
    y = 0,
    z = 0,
    w = 1,
    h = 1,
    d = 1,
    color = "white",
    dynamic = true,
    name = "Box",
    metalness = 0.2,
    roughness = 0.8,
    emissive = "#000000",
    collider = true,
  }
) {
  const linearColor = new Color(color);
  // linearColor.convertSRGBToLinear();

  const entity = makeEntity(world, name)
    .add(Transform, {
      position: new Vector3(x, y, z),
    })
    .add(BetterShape, {
      color: "#" + linearColor.getHexString(),
      boxSize: new Vector3(w, h, d),
      metalness,
      roughness,
      emissive,
    });

  // Optionally add a collider that matches the dimensions of the visible shape
  if (collider) {
    entity
      .add(RigidBody, {
        kind: dynamic ? "DYNAMIC" : "STATIC",
      })
      .add(Collider, {
        kind: "BOX",
        boxSize: new Vector3(w, h, d),
      });
  }
  return entity;
}
