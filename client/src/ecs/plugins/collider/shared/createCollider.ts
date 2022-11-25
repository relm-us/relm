import type { Collider, ColliderDesc, RigidBody } from "@dimforge/rapier3d";

import { MathUtils, Quaternion, Vector3 } from "three";

import {
  shapeParamsToColliderDesc,
  toShapeParams,
} from "~/ecs/shared/createShape";
import { Physics } from "~/ecs/plugins/physics";

import { Behavior, Collider3 } from "../components";
import { ColliderParams } from "./types";

export function createCollider(
  physics: Physics,
  params: ColliderParams,
  body: RigidBody
): Collider {
  const colliderDesc: ColliderDesc = shapeParamsToColliderDesc(
    physics.rapier,
    toShapeParams(params.spec.shape, params.spec.size)
  )
    .setActiveCollisionTypes(physics.rapier.ActiveCollisionTypes.ALL)
    .setActiveEvents(physics.rapier.ActiveEvents.COLLISION_EVENTS)
    .setTranslation(
      params.offset.x + params.spec.offset.x,
      params.offset.y + params.spec.offset.y,
      params.offset.z + params.spec.offset.z
    )
    .setRotation(params.rotation.multiply(params.spec.rotation))
    .setDensity(MathUtils.clamp(params.spec.density, 0, 1000))
    .setFriction(params.spec.friction)
    .setSensor(params.spec.behavior.isSensor)
    .setCollisionGroups(params.spec.behavior.interaction);

  return physics.world.createCollider(colliderDesc, body);
}
