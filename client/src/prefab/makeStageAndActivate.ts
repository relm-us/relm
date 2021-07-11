import { Transform } from "~/ecs/plugins/core";
import { LookAt, Camera } from "~/ecs/plugins/core";
import { Vector3, Quaternion, Euler } from "three";

import { Follow } from "~/ecs/plugins/follow";
import { DirectionalLight } from "~/ecs/plugins/lighting";

import { makeEntity } from "./makeEntity";

export function makeStageAndActivate(world, avatar) {
  // Create the singleton camera
  const cameraPosition = new Vector3(0, 5.5, 5);
  const camera = makeEntity(world, "Camera")
    .add(Transform, {
      position: cameraPosition,
      rotation: new Quaternion().setFromEuler(new Euler(-Math.PI / 4.5, 0, 0)),
    })
    .add(Follow, {
      entity: avatar.id,
      offset: cameraPosition,
    })
    .add(Camera)
    .activate();

  const lightOffset = new Vector3(-5, 5, 2);
  const lightPosition = new Vector3().add(cameraPosition).add(lightOffset);
  const shadowSize = 7.5;
  const light = makeEntity(world, "DirectionalLight")
    .add(Transform, {
      position: lightPosition,
    })
    .add(Follow, {
      entity: avatar.id,
      offset: lightOffset,
    })
    .add(DirectionalLight, {
      target: avatar.id,
      color: 0xffffff,
      intensity: 2.5,
      shadow: false, // TODO: make this turn on/off based on FPS
      shadowLeft: -shadowSize,
      shadowRight: shadowSize,
      shadowTop: shadowSize,
      shadowBottom: -shadowSize,
      shadowFar: 100,
      shadowRadius: 1.75,
      shadowDistanceGrowthRatio: 12,
    })
    .activate();

  return { camera, light };
}
