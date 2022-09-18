import { Transform } from "~/ecs/plugins/core";

import { Color, Vector3 } from "three";

import { Shape2 } from "~/ecs/plugins/form";
import { Collider2 } from "~/ecs/plugins/collider";

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
      position: new Vector3(x, y + r, z),
    })
    .add(Shape2, {
      kind: "SPHERE",
      size: new Vector3(r * 2, 1, 1),
      color: "#" + linearColor.getHexString(),
      metalness,
      roughness,
      emissive,
    });

  // Optionally add a collider that matches the dimensions of the visible shape
  if (collider) {
    entity.add(Collider2, {
      shape: "SPHERE",
      size: new Vector3(r * 2, 1, 1),
      kind: dynamic ? "DYNAMIC" : "BARRIER",
      density,
    });
  }
  return entity;
}
