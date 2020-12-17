import { Transform } from "hecs-plugin-core";
import { LookAt, Camera } from "hecs-plugin-three";
import { Vector3 } from "three";

import { Follow } from "~/ecs/plugins/follow";
import { DirectionalLight } from "~/ecs/plugins/lighting";

import { makeEntity } from "./makeEntity";

export function makeStageAndActivate(world, avatar) {
  // Create the singleton camera
  const cameraPosition = new Vector3(0, 10, 10);
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

  const lightOffset = new Vector3(-5, 5, 0);
  const lightPosition = new Vector3().add(cameraPosition).add(lightOffset);
  const shadowSize = 7.5;
  const light = makeEntity(world, "DirectionalLight")
    .add(Transform, {
      position: lightPosition,
    })
    // .add(LookAt, {
    //   entity: avatar.id,
    // })
    .add(Follow, {
      entity: camera.id,
      limit: "XYZ_AXIS",
      offset: lightOffset,
    })
    .add(DirectionalLight, {
      target: avatar.id,
      color: 0xaa9999,
      shadowLeft: -shadowSize,
      shadowRight: shadowSize,
      shadowTop: shadowSize,
      shadowBottom: -shadowSize,
      shadowFar: 100,
      shadowRadius: 1.75,
      shadowDistanceGrowthRatio: 12,
    })
    .activate();

  const sunLight = makeEntity(world, "DirectionalLight")
    .add(Transform, {
      position: new Vector3(5, 10, -20),
    })
    .add(Follow, {
      entity: avatar.id,
    })
    // .add(DirectionalLight, {
    //   color: 0xdddddd,
    // })
    .activate();

  return { camera, light, sunLight };
}
