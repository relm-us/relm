import { Transform, Asset } from "~/ecs/plugins/core";

import { Vector3, Quaternion, Euler } from "three";

import { RigidBody, Collider } from "~/ecs/plugins/physics";
import { TransformEffects } from "~/ecs/plugins/transform-effects";
import { Image } from "~/ecs/plugins/image";

import { makeEntity } from "./makeEntity";

export function makeImage(
  world,
  {
    x,
    y,
    z,
    w = 1,
    h = 1,
    d = 0.1,
    xa = 0,
    ya = 0,
    za = 0,
    url = "http://localhost:3000/asset/9809768b0111d0e82a05e5ecd82cdc8e-286840.webp",
    yOffset = 0,
    collide = false,
  }
) {
  const thing = makeEntity(world, "Image").add(Transform, {
    // Put it in the corner
    position: new Vector3(x, y, z),
    rotation: new Quaternion().setFromEuler(new Euler(xa, ya, za)),
    scale: new Vector3(w, h, d),
  });

  // if (yOffset !== 0) {
  //   thing.add(TransformEffects, {
  //     effects: [
  //       {
  //         function: "position",
  //         params: { position: new Vector3(0, yOffset, 0) },
  //       },
  //     ],
  //   });
  // }

  // Always add image
  thing.add(Image, {
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
