import { Transform, Asset } from "~/ecs/plugins/core";

import { Vector2, Vector3, Quaternion, Euler } from "three";

import { makeEntity } from "./makeEntity";

import { RigidBody, Collider } from "~/ecs/plugins/physics";
import { CssPlane, HdImage } from "~/ecs/plugins/css3d";
import { Draggable } from "~/ecs/plugins/clickable";

export function makeImage(
  world,
  {
    x,
    y,
    z,
    w = 3,
    h = 2,
    d = 0.1,
    xa = 0,
    ya = - Math.PI / 16,
    za = 0,
    url = "http://localhost:3000/asset/9809768b0111d0e82a05e5ecd82cdc8e-286840.webp",
    collide = false,
  }
) {
  const thing = makeEntity(world, "Image")
    .add(Transform, {
      position: new Vector3(x, y + h / 2, z),
      rotation: new Quaternion().setFromEuler(new Euler(xa, ya, za)),
    })
    .add(CssPlane, {
      circleRadius: 0.075,
      rectangleSize: new Vector2(w, h),
    })
    .add(Draggable)
    .add(HdImage, {
      asset: new Asset(url),
    });

  if (collide) {
    thing
      .add(RigidBody, {
        kind: "DYNAMIC",
      })
      .add(Collider, {
        kind: "BOX",
        boxSize: new Vector3(w, h, d),
      });
  }

  return thing;
}
