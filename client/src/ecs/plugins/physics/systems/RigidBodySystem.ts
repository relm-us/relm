import type { RigidBodyDesc as RapierRigidBodyDesc } from "@dimforge/rapier3d";

import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { RigidBody, RigidBodyRef } from "../components";

function getBodyStatus(rapier, kind) {
  switch (kind) {
    case "STATIC":
      return rapier.RigidBodyType.Fixed;
    case "DYNAMIC":
      return rapier.RigidBodyType.Dynamic;
    case "KINEMATIC":
      return rapier.RigidBodyType.KinematicPositionBased;
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

  static bodies: Map<number, Entity> = new Map();

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

    // TODO: Make this less obviously a hack
    if (entity.name === "Avatar") {
      rigidBodyDesc.restrictRotations(false, true, false);
    }

    if (spec.mass) rigidBodyDesc.setAdditionalMass(spec.mass);

    let rigidBody = world.createRigidBody(rigidBodyDesc);
    RigidBodySystem.bodies.set(rigidBody.handle, entity);

    entity.add(RigidBodyRef, { value: rigidBody });
  }

  remove(entity) {
    const { world } = (this.world as any).physics;
    const bodyRef = entity.get(RigidBodyRef);

    world.removeRigidBody(bodyRef.value);
    RigidBodySystem.bodies.delete(bodyRef.value.handle);
    entity.remove(RigidBodyRef);
  }

  reset(): void {
    RigidBodySystem.bodies.clear();
  }
}
