import { Transform } from "~/ecs/plugins/core";
import { Vector3 } from "three";

import { Follow } from "~/ecs/plugins/follow";
import { DirectionalLight } from "~/ecs/plugins/lighting";

import { makeEntity } from "./makeEntity";

export function makeLight(world, avatar, color = 0xffffff) {
  const cameraPosition = new Vector3(0, 5.5, 5);

  const lightOffset = new Vector3(-5, 5, 2);
  const lightPosition = new Vector3().add(cameraPosition).add(lightOffset);
  const shadowSize = 7.5;
  const light = makeEntity(world, "DirectionalLight")
    .add(Transform, {
      position: lightPosition,
    })
    .add(Follow, {
      target: avatar.id,
      offset: lightOffset,
      lerpAlpha: 1,
    })
    .add(DirectionalLight, {
      target: avatar.id,
      color,
      intensity: 2.5,
      shadow: true, // TODO: make this turn on/off based on FPS
      shadowLeft: -shadowSize,
      shadowRight: shadowSize,
      shadowTop: shadowSize,
      shadowBottom: -shadowSize,
      shadowFar: 100,
      shadowRadius: 1.75,
      shadowDistanceGrowthRatio: 12,
    });

  return light;
}
