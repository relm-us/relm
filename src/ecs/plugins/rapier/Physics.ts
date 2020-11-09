import { EventQueue, World, Vector3 } from "@dimforge/rapier3d";

export class Physics {
  rapier: any;
  world: World;
  gravity: Vector3;
  eventQueue: EventQueue;

  hecsWorld: any;
  Transform: any;

  constructor(world: World, rapier, Transform) {
    this.hecsWorld = world;

    this.rapier = rapier;
    this.gravity = new rapier.Vector3(0.0, -9.81, 0.0);
    this.world = new rapier.World(this.gravity);
    this.eventQueue = new rapier.EventQueue(true);

    this.Transform = Transform;
  }
}
