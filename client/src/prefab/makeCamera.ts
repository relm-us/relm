import { Transform, Camera } from "~/ecs/plugins/core";
import { Vector3, Quaternion, Euler } from "three";

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
    .add(Camera);

  return camera;
}
