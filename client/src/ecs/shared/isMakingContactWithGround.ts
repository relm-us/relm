import { AVATAR_INTERACTION } from "~/config/colliderInteractions";
import type { Vector3 } from "three";
import type { Ray } from "@dimforge/rapier3d";
import { Physics } from "~/ecs/plugins/physics/Physics";

// Time-of-impact distances
const MAX_GROUND_TOI = 1000000;
const CONTACT_TOI = 0.25;

let rayDown: Ray;

export function isMakingContactWithGround(physics: Physics, position: Vector3) {
  if (!rayDown) {
    rayDown = new physics.rapier.Ray(
      new physics.rapier.Vector3(0, 0, 0), // placeholder for position
      new physics.rapier.Vector3(0, -1, 0) // pointing down
    );
  }

  rayDown.origin.x = position.x;
  rayDown.origin.y = position.y;
  rayDown.origin.z = position.z;

  const colliders = physics.world.colliders;
  let contactBelow = false;
  // workaround for rapier bug: https://github.com/dimforge/rapier.js/issues/18
  if (colliders.len() > 0) {
    physics.world.intersectionsWithRay(
      colliders,
      rayDown,
      MAX_GROUND_TOI,
      true, // treat origin, if inside shape, as hollow
      AVATAR_INTERACTION,
      (isect) => {
        if (isect.toi < CONTACT_TOI) {
          contactBelow = true;
          // Don't keep looking for more intersections
          return false;
        } else {
          // Keep looking for ground
          return true;
        }
      }
    );
  }

  return contactBelow;
}
