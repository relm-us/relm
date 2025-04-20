import type { TransformData, Participant } from "~/types"

import { Vector3, Euler, type AnimationClip } from "three"

import { Transform } from "~/ecs/plugins/core"
import { Model3, ModelRef } from "~/ecs/plugins/model"
import { Animation } from "~/ecs/plugins/animation"

import { Avatar } from "../Avatar"
import { makeRemoteAvatarEntities } from "./makeRemoteAvatarEntities"
import type { DecoratedECSWorld } from "types/DecoratedECSWorld"
import { Oculus } from "~/ecs/plugins/html2d"
import { changeAnimationClip } from "./changeAnimationClip"

const e1 = new Euler(0, 0, 0, "YXZ")
const v1 = new Vector3()

export function avatarGetTransformData(this: void, avatar: Avatar): TransformData {
  const entities = avatar.entities
  if (!entities.body) return

  const transform = entities.body.get(Transform)
  if (!transform) return

  const transformData: any[] = []

  // Get position of body
  transform.position.toArray(transformData, 0)

  // Get angle of body
  e1.setFromQuaternion(transform.rotation)
  transformData[3] = e1.y

  // Get angle of head
  transformData[4] = avatar.headAngle

  // Get oculus height
  const oculus = entities.body.get(Oculus)
  if (oculus) {
    transformData[5] = oculus.targetOffset.y
  }

  // Get animation data
  const model: Model3 = entities.body.get(Model3)
  const ref: ModelRef = entities.body.get(ModelRef)
  const clips: AnimationClip[] = ref?.value?.animations
  const animation: Animation = entities.body.get(Animation)
  if (clips && animation) {
    transformData[6] = clips.findIndex((c) => c.name === animation.clipName)
    transformData[7] = animation.loop
    transformData[8] = model.offset.z
  }

  return transformData as TransformData
}

export function avatarSetTransformData(
  avatar: Avatar,
  [x, y, z, bodyAngle, headAngle, oculusOffset, clipIndex, animLoop, offsetZ]: TransformData,
) {
  const entities = avatar.entities
  if (!entities.body) return

  const transform = entities.body.get(Transform)
  if (!transform) return

  // Set position of body
  v1.set(x, y, z)
  if (v1.distanceToSquared(transform.position) > 2) {
    // Teleport over long distances
    transform.position.copy(v1)
  } else {
    // Lerp over short distances
    transform.position.lerp(v1, 0.3333)
  }

  // Set angle of body
  e1.setFromQuaternion(transform.rotation)
  e1.y = bodyAngle
  transform.rotation.setFromEuler(e1)

  // Update physics engine to accept position & rotation transformations
  transform.modified()

  // Set angle of head
  if (avatar) {
    avatar.headAngle = headAngle
  }

  // Set oculus height
  const oculus = entities.body.get(Oculus)
  if (oculus) oculus.targetOffset.y = oculusOffset

  // Set animation data
  const model: Model3 = entities.body.get(Model3)
  const ref: ModelRef = entities.body.get(ModelRef)
  const clips = ref?.value.animations
  if (clips && clipIndex >= 0 && clipIndex < clips.length) {
    const newClipName = clips[clipIndex]?.name
    changeAnimationClip(entities.body, newClipName, animLoop)
    if (offsetZ !== model.offset.z) {
      model.offset.z = offsetZ
      model.modified()
    }
  }
}

export function maybeMakeAvatar(ecsWorld: DecoratedECSWorld, participant: Participant, transformData: TransformData) {
  if (!transformData) {
    console.warn("can't make avatar, no transformData")
    return
  }
  if (!participant.avatar) {
    const position = new Vector3().fromArray(transformData as number[], 1)
    const entities = makeRemoteAvatarEntities(ecsWorld, participant.participantId, {
      position,
      getHeadAngle: () => {
        return participant.avatar?.headAngle
      },
    })
    participant.avatar = new Avatar(ecsWorld, entities)
  }
}
