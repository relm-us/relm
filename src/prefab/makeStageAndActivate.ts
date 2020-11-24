import { Transform } from "hecs-plugin-core";
import { LookAt, Camera } from "hecs-plugin-three";
import { Vector3 } from "three";

import { Follow } from "~/ecs/plugins/follow";
import { DirectionalLight } from "~/ecs/plugins/lighting";

import { makeEntity } from "./makeEntity";

export function makeStageAndActivate(world, avatar) {
  // Create the singleton camera
  const camera = makeEntity(world, "Camera")
    .add(Transform, {
      position: new Vector3(0, 3, 5),
    })
    .add(LookAt, {
      entity: avatar.id,
      limit: "X_AXIS",
    })
    .add(Follow, {
      entity: avatar.id,
      limit: "X_AXIS",
    })
    .add(Camera)
    .activate();

  const light = makeEntity(world, "DirectionalLight")
    .add(Transform, {
      position: new Vector3(-20, 20, 10),
    })
    .add(Follow, {
      entity: avatar.id,
    })
    .add(DirectionalLight, {
      color: 0x553333,
      shadowTop: 24 - 10,
      shadowBottom: -24 - 10,
    })
    .activate();

  const sunLight = makeEntity(world, "DirectionalLight")
    .add(Transform, {
      position: new Vector3(5, 10, -20),
    })
    .add(Follow, {
      entity: avatar.id,
    })
    .add(DirectionalLight, {
      color: 0xdddddd,
    })
    .activate();

  return { camera, light, sunLight };
}
