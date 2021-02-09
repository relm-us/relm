import { System, Groups, Not, Modified } from "~/ecs/base";
import { WorldTransform, Transform } from "~/ecs/plugins/core";
import { RigidBody, RigidBodyRef } from "../components";
import type { RigidBodyDesc as RapierRigidBodyDesc } from "@dimforge/rapier3d";

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
    const { world, rapier } = (this.world as any).physics;
    const spec = entity.get(RigidBody);
    const transform = entity.get(Transform);

    let rigidBodyDesc: RapierRigidBodyDesc = new rapier.RigidBodyDesc(
      getBodyStatus(rapier, spec.kind)
    )
      .setTranslation(
        transform.position.x,
        transform.position.y,
        transform.position.z
      )
      .setRotation(transform.rotation)
      .setLinearDamping(spec.linearDamping)
      .setAngularDamping(spec.angularDamping);

    if (spec.mass) rigidBodyDesc.setMass(spec.mass);

    let rigidBody = world.createRigidBody(rigidBodyDesc);

    entity.add(RigidBodyRef, { value: rigidBody });
  }

  remove(entity) {
    const { world } = (this.world as any).physics;
    const bodyRef = entity.get(RigidBodyRef);

    world.removeRigidBody(bodyRef.value);
    entity.remove(RigidBodyRef);
  }
}
