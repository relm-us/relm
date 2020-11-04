import { Transform } from "hecs-plugin-core";

export class Physics {
  rapier: any;
  world: any;
  hecsWorld: any;
  gravity: any;

  Transform: any;

  constructor(world) {
    this.hecsWorld = world;
    this.gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    this.world = new RAPIER.World(this.gravity);

    this.Transform = Transform;
  }
}
