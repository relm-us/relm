import { Quaternion, Euler } from "three";

import { Transform } from "~/ecs/plugins/core";
import { AlwaysOnStage, Camera } from "~/ecs/plugins/camera";

import { makeEntity } from "./makeEntity";

// 5.6 radians is approx. looking at center of Avatar from above
export function makeCamera(world) {
  // Create the singleton camera
  const camera = makeEntity(world, "Camera")
    .add(Transform)
    .add(AlwaysOnStage)
    .add(Camera);

  return camera;
}
