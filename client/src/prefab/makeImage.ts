import { Transform, Asset } from "~/ecs/plugins/core";
import { Image } from "~/ecs/plugins/image";

import { Vector3, Quaternion, Euler } from "three";

import { makeEntity } from "./makeEntity";

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
    ya = -Math.PI / 16,
    za = 0,
    url = "",
  }
) {
  const image = makeEntity(world, "Image")
    .add(Transform, {
      position: new Vector3(x, y + h / 2, z),
      rotation: new Quaternion().setFromEuler(new Euler(xa, ya, za)),
    })
    .add(Asset, {
      asset: new Asset(url),
    })
    .add(Image, {});

  return image;
}
