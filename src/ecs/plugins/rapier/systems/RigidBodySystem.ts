import { System, Groups, Not, Modified } from "hecs";
import { RigidBody, RigidBodyRef } from "../components";

function getBodyStatus(rapier, kind) {
  switch (kind) {
    case "STATIC":
      return rapier.BodyStatus.Static;
    case "DYNAMIC":
      return rapier.BodyStatus.Dynamic;
    case "KINEMATIC":
      return rapier.BodyStatus.Kinematic;
    default:
      throw new Error(`Kind of body status unknown: '${kind}'`);
  }
}

export class RigidBodySystem extends System {
  order = Groups.Initialization;

  static queries = {
    added: [RigidBody, Not(RigidBodyRef)],
    modified: [Modified(RigidBody), RigidBodyRef],
    removed: [Not(RigidBody), RigidBodyRef],
  };

  update() {
    // create RigidBodyRef from spec
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    // replace RigidBodyRef with new spec
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    // remove RigidBody
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const { world, rapier, Transform } = this.world.physics;
    const spec = entity.get(RigidBody);
    const transform = entity.get(Transform);

    let rigidBodyDesc = new rapier.RigidBodyDesc(
      getBodyStatus(rapier, spec.kind)
    )
      .setTranslation(transform.position)
      .setRotation(transform.rotation);
    let rigidBody = world.createRigidBody(rigidBodyDesc);

    entity.add(RigidBodyRef, { value: rigidBody });
  }

  remove(entity) {
    const { world } = this.world.physics;
    const bodyRef = entity.get(RigidBodyRef);

    world.removeRigidBody(bodyRef.value.handle);
  }
}
