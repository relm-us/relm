import { EventQueue, Vector3, World as RapierWorld } from "@dimforge/rapier3d";
import { World, Entity } from "~/ecs/base";

export class Physics {
  rapier: any;
  world: RapierWorld;
  gravity: Vector3;
  eventQueue: EventQueue;
  handleToEntity: Map<number, Entity>;

  hecsWorld: World;

  constructor(world: World, rapier) {
    this.hecsWorld = world;

    this.rapier = rapier;
    this.gravity = new rapier.Vector3(0.0, -9.81, 0.0);
    this.world = new rapier.World(this.gravity);
    this.eventQueue = new rapier.EventQueue(true);
    this.handleToEntity = new Map();
  }
}
