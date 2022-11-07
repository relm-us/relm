import type {
  Collider,
  EventQueue,
  RigidBody,
  RigidBodyDesc,
  Vector3,
  World as RapierWorld,
} from "@dimforge/rapier3d";
import { World, Entity } from "~/ecs/base";

export class Physics {
  rapier: any;
  world: RapierWorld;
  gravity: Vector3;

  // rapier queue of collision/trigger events
  eventQueue: EventQueue;

  // Map from rapier ColliderRef handle to Entity
  colliders: Map<number, Entity>;

  // Map from rapier RigidBodyRef handle to Entity
  bodies: Map<number, Entity>;

  hecsWorld: World;

  constructor(world: World, rapier) {
    this.hecsWorld = world;

    this.rapier = rapier;
    this.gravity = new rapier.Vector3(0.0, -9.81, 0.0);
    this.world = new rapier.World(this.gravity);
    this.eventQueue = new rapier.EventQueue(true);

    this.colliders = new Map();
    this.bodies = new Map();
  }

  addBody(body: RigidBody, entity: Entity) {
    this.bodies.set(body.handle, entity);
  }

  removeBody(body: RigidBody) {
    this.bodies.delete(body.handle);
    this.world.removeRigidBody(body);
  }

  addCollider(collider: Collider, entity: Entity) {
    this.colliders.set(collider.handle, entity);
  }

  removeCollider(collider: Collider) {
    this.colliders.delete(collider.handle);
    this.world.removeCollider(collider, false);
  }

  deinit() {
    this.colliders.clear();
    this.bodies.clear();
    // TODO: reset world, hecsWorld?
  }
}
