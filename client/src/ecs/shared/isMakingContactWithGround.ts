import type { Ray } from "@dimforge/rapier3d"

import { Vector3 } from "three"

import { AVATAR_INTERACTION } from "~/config/colliderInteractions"
import type { Physics } from "~/ecs/plugins/physics/Physics"

// Time-of-impact distances
const MAX_GROUND_TOI = 1000000
const CONTACT_TOI = 0.25

let rayDown: Ray
const hitPoint = new Vector3()
const vec = new Vector3()

export function intersectionPointWithGround(physics: Physics, position: Vector3, maxToi: number = null): Vector3 {
  if (!rayDown) {
    rayDown = new physics.rapier.Ray(
      new physics.rapier.Vector3(0, 0, 0), // placeholder for position
      new physics.rapier.Vector3(0, -1, 0), // pointing down
    )
  }

  rayDown.origin.x = position.x
  rayDown.origin.y = position.y
  rayDown.origin.z = position.z

  let contactBelow: Vector3 = null
  physics.world.intersectionsWithRay(
    rayDown,
    MAX_GROUND_TOI,
    true, // treat origin, if inside shape, as hollow
    (isect) => {
      if (maxToi === null || isect.toi < maxToi) {
        vec.copy(rayDown.dir as Vector3).multiplyScalar(isect.toi)
        hitPoint.copy(position).add(vec)
        contactBelow = hitPoint
        // Don't keep looking for more intersections
        return false
      }

      // Keep looking for ground
      return true
    },
    null,
    AVATAR_INTERACTION,
  )

  return contactBelow
}

export function isMakingContactWithGround(physics: Physics, position: Vector3) {
  const contact = Boolean(intersectionPointWithGround(physics, position, CONTACT_TOI))
  return contact
}
