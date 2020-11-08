export class Physics {
  rapier: any;
  world: any;
  hecsWorld: any;
  gravity: any;

  Transform: any;

  constructor(world, rapier, Transform) {
    this.hecsWorld = world;

    this.rapier = rapier;
    this.gravity = new rapier.Vector3(0.0, -9.81, 0.0);
    this.world = new rapier.World(this.gravity);

    this.Transform = Transform;
  }
}
