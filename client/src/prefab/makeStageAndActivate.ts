import { Transform } from "~/ecs/plugins/core";
import { LookAt, Camera } from "~/ecs/plugins/three";
import { Vector3 } from "three";

import { Follow } from "~/ecs/plugins/follow";
import { DirectionalLight } from "~/ecs/plugins/lighting";

import { makeEntity } from "./makeEntity";

export function makeStageAndActivate(world, avatar) {
  // Create the singleton camera
  const cameraPosition = new Vector3(0, 5, 5);
  const camera = makeEntity(world, "Camera")
    .add(Transform, {
      position: cameraPosition,
    })
    .add(LookAt, {
      entity: avatar.id,
    })
    .add(Follow, {
      entity: avatar.id,
      limit: "XYZ_AXIS",
      offset: cameraPosition,
    })
    .add(Camera)
    .activate();

  const lightOffset = new Vector3(-10, 25, -10);
  const lightPosition = new Vector3().add(cameraPosition).add(lightOffset);
  const shadowSize = 5;
  const light = makeEntity(world, "DirectionalLight")
    .add(Transform, {
      position: lightPosition,
    })
    // .add(Follow, {
    //   entity: camera.id,
    //   limit: "XZ_AXIS",
    //   offset: lightOffset,
    // })
    .add(DirectionalLight, {
      target: avatar.id,
      color: 0x999999,
      shadowLeft: -shadowSize,
      shadowRight: shadowSize,
      shadowTop: shadowSize,
      shadowBottom: -shadowSize,
      shadowFar: 100,
      shadowRadius: 1.75,
    })
    .activate();

  return { camera, light };
}
