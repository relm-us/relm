import { Quaternion, Euler } from "three";

import { Transform } from "~/ecs/plugins/core";
import { AlwaysOnStage, Camera } from "~/ecs/plugins/camera";

import { makeEntity } from "./makeEntity";

// 5.6 radians is approx. looking at center of Avatar from above
export function makeCamera(world, perspectiveAngle = 5.6) {
  // Create the singleton camera
  const camera = makeEntity(world, "Camera")
    .add(Transform, {
      rotation: new Quaternion().setFromEuler(
        new Euler(perspectiveAngle, 0, 0, "XYZ")
      ),
    })
    .add(AlwaysOnStage)
    .add(Camera);

  return camera;
}
