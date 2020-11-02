import { System, Groups, Not, Modified } from "hecs";
import { RigidBody, RigidBodyRef } from "../components";

function getBodyStatus(kind) {
  switch (kind) {
    case "STATIC":
      return RAPIER.BodyStatus.Static;
    case "DYNAMIC":
      return RAPIER.BodyStatus.Dynamic;
    case "KINEMATIC":
      return RAPIER.BodyStatus.Kinematic;
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
    const { world, Transform } = this.world.physics;
    const spec = entity.get(RigidBody);
    const transform = entity.get(Transform);

    let rigidBodyDesc = new RAPIER.RigidBodyDesc(getBodyStatus(spec.kind))
      .setTranslation(transform.position)
      .setRotation(transform.rotation);
    let rigidBody = world.createRigidBody(rigidBodyDesc);

    entity.add(RigidBodyRef, { value: rigidBody });
  }

  remove(entity) {
    const { world } = this.world.physics;
    const spec = entity.get(RigidBodyRef);
    world.removeRigidBody(spec.value);

    // @note We cant delete the reference because ColliderSystem
    // needs to detach its shape from this.
    // body.delete()
  }
}
