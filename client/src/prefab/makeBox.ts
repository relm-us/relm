import { Transform } from "~/ecs/plugins/core";
import { Color, Vector3, Quaternion, Euler } from "three";

import { Shape2 } from "~/ecs/plugins/shape";
import { Collider2 } from "~/ecs/plugins/physics";

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
    rx = 0,
    ry = 0,
    rz = 0,
    color = "white",
    name = "Box",
    metalness = 0.0,
    roughness = 0.25,
    emissive = "#000000",
    collider = true,
  }
) {
  const linearColor = new Color(color);

  const entity = makeEntity(world, name)
    .add(Transform, {
      position: new Vector3(x, y + h / 2, z),
      rotation: new Quaternion().setFromEuler(new Euler(rx, ry, rz, "XYZ")),
    })
    .add(Shape2, {
      color: "#" + linearColor.getHexString(),
      size: new Vector3(w, h, d),
      metalness,
      roughness,
      emissive,
    });

  // Optionally add a collider that matches the dimensions of the visible shape
  if (collider) {
    entity.add(Collider2, {
      shape: "BOX",
      size: new Vector3(w, h, d),
    });
  }
  return entity;
}
