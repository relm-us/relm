import { Transform, Camera } from "~/ecs/plugins/core";
import { Vector3 } from "three";

import { Follow } from "~/ecs/plugins/follow";
import { LookAt } from "~/ecs/plugins/look-at";

import { makeEntity } from "./makeEntity";

const AVATAR_HEIGHT = 1.5;

export function makeCamera(world, avatar) {
  // Create the singleton camera
  const cameraPosition = new Vector3(0, 5.5, 5);
  const camera = makeEntity(world, "Camera")
    .add(Transform, {
      position: cameraPosition,
    })
    .add(Follow, {
      target: avatar.id,
      offset: cameraPosition,
    })
    .add(LookAt, {
      target: avatar.id,
      limit: "X_AXIS",
      offset: new Vector3(0, AVATAR_HEIGHT, 0),
    })
    .add(Camera);

  return camera;
}
