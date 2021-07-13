import { Transform, Camera } from "~/ecs/plugins/core";
import { Vector3 } from "three";

import { Follow } from "~/ecs/plugins/follow";
import { LookAt } from "~/ecs/plugins/look-at";

import { makeEntity } from "./makeEntity";

export function makeCamera(world) {
  // Create the singleton camera
  const camera = makeEntity(world, "Camera")
    .add(Transform, {
      position: new Vector3(0, 5.5, 5),
    })
    .add(Camera);

  return camera;
}
