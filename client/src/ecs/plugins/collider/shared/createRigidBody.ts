import type { RigidBody, RigidBodyDesc } from "@dimforge/rapier3d"

import type { Entity } from "~/ecs/base"
import { Transform } from "~/ecs/plugins/core"
import type { Physics } from "~/ecs/plugins/physics"

import { type Behavior, PhysicsOptions } from "../components"

export function createRigidBody(physics: Physics, entity: Entity, behavior: Behavior): RigidBody {
  const transform = entity.get(Transform)

  const options: PhysicsOptions = entity.get(PhysicsOptions) || new PhysicsOptions(physics.hecsWorld)
  const rr = options.rotRestrict.toUpperCase()

  const bodyDesc: RigidBodyDesc = new physics.rapier.RigidBodyDesc(behavior.bodyType)
    .setTranslation(transform.position.x, transform.position.y, transform.position.z)
    .setRotation(transform.rotation)
    .setAdditionalMass(options.additionalMass)
    .setLinearDamping(options.linDamp)
    .setAngularDamping(options.angDamp)
    .restrictRotations(rr.includes("X"), rr.includes("Y"), rr.includes("Z"))

  return physics.world.createRigidBody(bodyDesc)
}
