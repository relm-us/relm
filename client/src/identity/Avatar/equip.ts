import type { Equipment } from "relm-common"
import type { AvatarEntities, DecoratedECSWorld } from "~/types"

import { Vector3, Quaternion, Euler } from "three"

import { AVATAR_BODY_SCALE } from "~/config/constants"

import { makeEntity } from "~/prefab/makeEntity"
import { makeBox } from "~/prefab/makeBox"

import type { Entity } from "~/ecs/base"
import { BoneAttach } from "~/ecs/plugins/bone-attach"
import { Item2 } from "~/ecs/plugins/item"
import { Asset, Transform } from "~/ecs/plugins/core"
import { Model3 } from "~/ecs/plugins/model"
import { FaceMapColors2, FaceMapColorsActive } from "~/ecs/plugins/coloration"
import { AlwaysOnStage } from "~/ecs/plugins/camera"
import { ChildAttach } from "~/ecs/plugins/child-attach"

const HAND_LENGTH = 0.25
const BACK_OFFSET = 0.25

const q1 = new Quaternion()

export function setEquipped(this: void, entities: AvatarEntities, equipment: Equipment) {
  if (equipment) {
    showHoldingIndicator(entities, equipment)
  } else {
    removeHoldingIndicator(entities)
  }
}

export function showHoldingIndicator(entities: AvatarEntities, equipment: Equipment) {
  if (!entities) {
    console.warn("Can't showHoldingIndicator: avatar not available")
    return
  }

  const heldEntity = makeHeldEntity(entities.body.world as DecoratedECSWorld, equipment).activate()

  const item = new Item2(null).fromJSON({
    position: equipment.position,
    rotation: equipment.rotation,
    scale: equipment.scale,
  })

  if (equipment.bone === "CENTER") {
    // not a bone
    entities.body.add(ChildAttach, {
      entityToAttachId: heldEntity.id,
      position: item.position.divideScalar(AVATAR_BODY_SCALE),
      rotation: item.rotation,
      scale: item.scale.divideScalar(AVATAR_BODY_SCALE),
    })
  } else {
    const version = equipment.version ?? "1"

    if (version === "1") {
      const attachParams = getBoneAttachParamsLegacy(equipment)
      const { position, rotation, scale } = equipment
      const item = new Item2(null).fromJSON({ position, rotation, scale })
      attachParams.position.add(item.position)
      attachParams.rotation.copy(item.rotation)
      attachParams.scale.copy(item.scale)

      // Will add (or modify, if BoneAttach already exists)
      entities.body.add(BoneAttach, {
        entityToAttachId: heldEntity.id,
        ...attachParams,
      })
    } else if (version === "2") {
      const { boneName, rotation } = getBoneAttachParams(equipment)
      entities.body.add(BoneAttach, {
        entityToAttachId: heldEntity.id,
        boneName,
        position: item.position.divideScalar(AVATAR_BODY_SCALE),
        rotation: item.rotation.premultiply(rotation),
        scale: item.scale.divideScalar(AVATAR_BODY_SCALE),
      })
    }
  }

  return heldEntity
}

export function removeHoldingIndicator(entities: AvatarEntities) {
  if (!entities) return

  entities.body.maybeRemove(ChildAttach)
  entities.body.maybeRemove(BoneAttach)
  entities.equipped?.destroy()
  delete entities.equipped
}

function makeHeldEntity(world: DecoratedECSWorld, equipment: Equipment): Entity {
  const object = equipment.object
  switch (object.type) {
    case "model": {
      const entity = makeEntity(world, "Held")
        .add(AlwaysOnStage)
        .add(Transform)
        .add(Model3, { asset: new Asset(object.assetUrl) })

      if (object.facemapColors) {
        entity.add(FaceMapColorsActive).add(FaceMapColors2, {
          colors: object.facemapColors,
        })
      }

      return entity
    }

    // TODO: implement "shape"
    // case "shape": {}
    default:
      return makeBox(world, {
        name: "Held",
        w: 0.8,
        h: 0.8,
        d: 0.8,
        color: "#cc9900",
        collider: false,
      })
  }
}

function getBoneAttachParams(equipment: Equipment) {
  const rotation = new Quaternion()
  const turn = ({ x = 0, y = 0, z = 0 }) =>
    rotation.multiply(q1.setFromEuler(new Euler(Math.PI * x, Math.PI * y, Math.PI * z)))
  switch (equipment.bone) {
    case "HEAD":
      return { boneName: "mixamorigHeadTop_End", rotation }
    case "BACK":
      return { boneName: "mixamorigSpine2", rotation }
    case "HIPS":
      return { boneName: "mixamorigHips", rotation }
    case "LEFT_HAND":
      return { boneName: "mixamorigLeftHand", rotation }
    case "RIGHT_LEG":
      turn({ z: 1 })
      return { boneName: "mixamorigRightLeg", rotation }
    case "LEFT_LEG":
      turn({ z: 1 })
      return { boneName: "mixamorigLeftLeg", rotation }
    case "RIGHT_FOOT":
      turn({ x: -0.5, z: 1 })
      return { boneName: "mixamorigRightToeBase", rotation }
    case "LEFT_FOOT":
      turn({ x: -0.5, z: 1 })
      return { boneName: "mixamorigLeftToeBase", rotation }
    default:
      /* RIGHT_HAND */ return { boneName: "mixamorigRightHand", rotation }
  }
}

function getBoneAttachParamsLegacy(equipment: Equipment) {
  const height = 1.0
  switch (equipment.bone) {
    case "HEAD":
      return {
        boneName: "mixamorigHeadTop_End",
        position: new Vector3(0, height / 2, 0),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1),
      }
    case "BACK":
      return {
        boneName: "mixamorigSpine2",
        position: new Vector3(0, 0, -height / 2 - BACK_OFFSET),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1),
      }
    case "HIPS":
      return {
        boneName: "mixamorigHips",
        position: new Vector3(0, 0, 0),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1),
      }
    default:
      return {
        boneName: "mixamorigRightHand",
        position: new Vector3(0, height / 2 + HAND_LENGTH, 0),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1),
      }
  }
}

/**
 * Bones:
 *
 * mixamorigHips
 * mixamorigSpine
 * mixamorigSpine1
 * mixamorigSpine2
 * mixamorigNeck
 * mixamorigHead
 * mixamorigHeadTop_End
 * mixamorigLeftShoulder
 * mixamorigLeftArm
 * mixamorigLeftForeArm
 * mixamorigLeftHand
 * mixamorigRightShoulder
 * mixamorigRightArm
 * mixamorigRightForeArm
 * mixamorigRightHand
 * mixamorigLeftUpLeg
 * mixamorigLeftLeg
 * mixamorigLeftFoot
 * mixamorigLeftToeBase
 * mixamorigLeftToe_End
 * mixamorigRightUpLeg
 * mixamorigRightLeg
 * mixamorigRightFoot
 * mixamorigRightToeBase
 * mixamorigRightToe_End
 *
 */
