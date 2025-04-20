import { Vector3, Quaternion, MathUtils, type Object3D } from "three"

import { AVATAR_RECENTER_HEAD_NO_POINTER_MOTION } from "~/config/constants"
import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors"

import type { Entity } from "~/ecs/base"
import { PointerPositionRef } from "~/ecs/plugins/pointer-position"
import { BoneTwistRef } from "~/ecs/plugins/bone-twist"
import { ControllerState } from "~/ecs/plugins/player-control"
import type { WorldPlanes } from "~/ecs/shared/WorldPlanes"

const vPointerPos = new Vector3()
const vBodyFacing = new Vector3()
const vUp = new Vector3(0, 1, 0)
const vOut = new Vector3(0, 0, 1)
const qParent = new Quaternion()
const vParent = new Vector3()
const vLookAt = new Vector3()

export const headFollowsPointer = (setAngle?: (angle: number) => void) => (entity: Entity) => {
  const state: ControllerState = entity.get(ControllerState)
  const ppref: PointerPositionRef = entity.get(PointerPositionRef)
  const pointer: WorldPlanes = ppref.value
  const parent = entity.get(BoneTwistRef).parent

  parent.getWorldQuaternion(qParent)
  parent.getWorldPosition(vParent)

  vPointerPos.copy(pointer.points.XZ).sub(vParent)
  vPointerPos.y = 0

  vBodyFacing.copy(vOut)
  vBodyFacing.applyQuaternion(qParent)
  vBodyFacing.y = 0

  if (state.speed > 0) {
    // Walking/running means we stop heeding the pointer position
    ppref.avatarMovedAt = pointer.updatedAt
  }

  // Only move head if...
  let enabled =
    // not running or walking, and
    state.speed === 0 &&
    // avatar did not recently move, and
    pointer.updatedAt > ppref.avatarMovedAt &&
    // pointer recently moved, and
    performance.now() - pointer.updatedAt < AVATAR_RECENTER_HEAD_NO_POINTER_MOTION &&
    // mouse pointer is a little distance away from the avatar
    vPointerPos.length() > 0.5

  /**
   * 1. Get the signed angle between vectors on a plane (vUp).
   * 2. Clamp it to a reasonable value so that the head doesn't swivel backwards.
   *
   * vBodyFacing: see above
   * pointer.XZ: a Vector3 where the mouse is positioned on the XZ plane
   * vUp: the XZ normal plane
   */
  const angle = MathUtils.clamp(
    signedAngleBetweenVectors(vBodyFacing, enabled ? vPointerPos : vBodyFacing, vUp),
    /**
     * Any more than (0.49)PI and the slerp below will make it so
     * the head moves in an "impossible" way because the shortest
     * angle from looking over one shoulder to the other shoulder
     * is to spin the head backwards.
     */
    -Math.PI * 0.49,
    Math.PI * 0.49,
  )
  setAngle?.(angle)

  vLookAt.copy(vBodyFacing)
  vLookAt.applyAxisAngle(vUp, angle)

  return vLookAt
}

export const headFollowsAngle = (getAngle: () => number) => (entity: Entity) => {
  const angle = getAngle()
  if (angle === null || angle === undefined || Number.isNaN(angle)) return

  const pointer: WorldPlanes = entity.get(PointerPositionRef).value
  const parent: Object3D = entity.get(BoneTwistRef).parent

  parent.getWorldQuaternion(qParent)
  parent.getWorldPosition(vParent)

  vPointerPos.copy(pointer.points.XZ).sub(vParent)
  vPointerPos.y = 0

  vBodyFacing.copy(vOut)
  vBodyFacing.applyQuaternion(qParent)
  vBodyFacing.y = 0

  vLookAt.copy(vBodyFacing)
  vLookAt.applyAxisAngle(vUp, angle)

  return vLookAt
}
