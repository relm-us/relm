import type { Collider, EventQueue, RigidBody, World as RapierWorld } from "@dimforge/rapier3d"
import type { World, Entity } from "~/ecs/base"

export class Physics {
  // The ECS world
  hecsWorld: World

  // A late-bound reference to the entire Rapier3d physics library
  rapier: any

  // The physics engine world
  world: RapierWorld

  // rapier queue of collision/trigger events
  eventQueue: EventQueue

  // Map from rapier Collider handle to Entity
  colliders: Map<number, Entity>

  // Map from rapier RigidBody handle to Entity
  bodies: Map<number, Entity>

  constructor(world: World, rapier) {
    this.hecsWorld = world

    this.rapier = rapier
    this.world = new rapier.World(new rapier.Vector3(0.0, -9.81, 0.0))
    this.eventQueue = new rapier.EventQueue(true)

    this.colliders = new Map()
    this.bodies = new Map()
  }

  addBody(body: RigidBody, entity: Entity) {
    this.bodies.set(body.handle, entity)
  }

  removeBody(body: RigidBody) {
    if (!this.bodies.has(body.handle)) console.warn("no body handle", body.handle)
    this.bodies.delete(body.handle)
    this.world.removeRigidBody(body)
  }

  addCollider(collider: Collider, entity: Entity) {
    this.colliders.set(collider.handle, entity)
  }

  removeCollider(collider: Collider) {
    if (!this.colliders.has(collider.handle)) console.warn("no collider handle", collider.handle)
    this.colliders.delete(collider.handle)
    this.world.removeCollider(collider, false)
  }

  deinit() {
    this.colliders.clear()
    this.bodies.clear()
    // TODO: reset world, hecsWorld?
  }
}
