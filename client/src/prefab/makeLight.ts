import { Transform } from "~/ecs/plugins/core"
import { Vector3 } from "three"

import { Follow } from "~/ecs/plugins/follow"
import { DirectionalLight } from "~/ecs/plugins/lighting"

import { makeEntity } from "./makeEntity"
import { DEFAULT_DIRECTIONAL_LIGHT_POSITION } from "~/config/constants"
import { AlwaysOnStage } from "~/ecs/plugins/camera"

export function makeLight(world, avatar, color = 0xffffff) {
  const shadowSize = 6
  const light = makeEntity(world, "DirectionalLight")
    .add(Transform)
    .add(Follow, {
      target: avatar.id,
      offset: new Vector3().fromArray(DEFAULT_DIRECTIONAL_LIGHT_POSITION),
      // Move light instantaneously to new position:
      dampening: 0.001,
    })
    .add(AlwaysOnStage)
    .add(DirectionalLight, {
      target: avatar.id,
      color,
      intensity: 2.5,
      shadow: true, // TODO: make this turn on/off based on FPS

      shadowLeft: -shadowSize,
      shadowRight: shadowSize,
      shadowTop: shadowSize,
      shadowBottom: -shadowSize,

      shadowNear: 0.5,
      shadowFar: 500,

      shadowWidth: 512,
      shadowHeight: 512,

      shadowRadius: 1.75,
    })

  return light
}
