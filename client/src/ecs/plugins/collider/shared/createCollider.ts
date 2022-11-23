import type { Collider, ColliderDesc, RigidBody } from "@dimforge/rapier3d";

import { MathUtils, Quaternion, Vector3 } from "three";

import {
  shapeParamsToColliderDesc,
  toShapeParams,
} from "~/ecs/shared/createShape";
import { Physics } from "~/ecs/plugins/physics";

import { Behavior, Collider3 } from "../components";

export function createCollider(
  physics: Physics,
  collider: Collider3,
  body: RigidBody,
  rotation: Quaternion,
  offset: Vector3,
  behavior: Behavior
): Collider {
  const colliderDesc: ColliderDesc = shapeParamsToColliderDesc(
    physics.rapier,
    toShapeParams(collider.shape, collider.size)
  )
    .setActiveCollisionTypes(physics.rapier.ActiveCollisionTypes.ALL)
    .setActiveEvents(physics.rapier.ActiveEvents.COLLISION_EVENTS)
    .setTranslation(
      offset.x + collider.offset.x,
      offset.y + collider.offset.y,
      offset.z + collider.offset.z
    )
    .setRotation(rotation.multiply(collider.rotation))
    .setDensity(MathUtils.clamp(collider.density, 0, 1000))
    .setFriction(collider.friction)
    .setSensor(behavior.isSensor)
    .setCollisionGroups(behavior.interaction);

  return physics.world.createCollider(colliderDesc, body);
}
