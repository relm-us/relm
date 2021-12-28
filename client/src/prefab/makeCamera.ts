import { Transform, Camera } from "~/ecs/plugins/core";
import { Vector3, Quaternion, Euler } from "three";

import { makeEntity } from "./makeEntity";

export function makeCamera(world) {
  // Create the singleton camera
  const camera = makeEntity(world, "Camera")
    .add(Transform, {
      position: new Vector3(0, 5.5, 5),
      // 5.6 radians is approx. looking at center of Avatar from above
      rotation: new Quaternion().setFromEuler(new Euler(5.6, 0, 0, "XYZ")),
    })
    .add(Camera);

  return camera;
}
