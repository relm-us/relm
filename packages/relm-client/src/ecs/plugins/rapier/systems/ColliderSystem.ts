import { System, Groups, Not, Modified } from "hecs";
import { RigidBody, RigidBodyRef, Collider, ColliderRef } from "../components";
import type { ColliderDesc as RapierColliderDesc } from "@dimforge/rapier3d";

export class ColliderSystem extends System {
  order = Groups.Initialization + 10; // After RigidBodySystem

  static queries = {
    added: [Collider, Not(ColliderRef), RigidBodyRef],
    modifiedBody: [ColliderRef, Modified(RigidBody)],
    modified: [Modified(Collider), RigidBodyRef],
    removed: [Not(Collider), ColliderRef],
  };

  update() {
    // create new ColliderRef
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modifiedBody.forEach((entity) => {
      this.remove(entity);
    });
    // replace ColliderRef with new spec
    this.queries.modified.forEach((entity) => {
      this.build(entity);
    });
    // Remove ColliderRef
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const spec = entity.get(Collider);
    const rigidBodyRef = entity.get(RigidBodyRef);
    const colliderRef = entity.get(ColliderRef);
    const { world, rapier } = this.world.physics;

    // Create a cuboid collider attached to rigidBody.
    let colliderDesc: RapierColliderDesc;
    switch (spec.shape) {
      case "BOX":
        const size = spec.boxSize;
        colliderDesc = rapier.ColliderDesc.cuboid(
          size.x / 2,
          size.y / 2,
          size.z / 2
        );
        break;
      case "SPHERE":
        colliderDesc = rapier.ColliderDesc.ball(spec.sphereRadius);
        break;
      case "CAPSULE":
        colliderDesc = rapier.ColliderDesc.capsule(
          spec.capsuleHeight / 2,
          spec.capsuleRadius
        );
        break;
      default:
        throw new Error(`Unknown collider shape: ${spec.shape}`);
    }

    colliderDesc.setDensity(spec.density);

    if (colliderRef) {
      // TODO: If fixed in Rapier, we can remove the setTimeout
      setTimeout(() => {
        world.removeCollider(colliderRef.value);
      }, 0);
    }

    let collider = world.createCollider(
      colliderDesc,
      rigidBodyRef.value.handle
    );
    if (collider.handle === undefined) {
      console.error("Collider handle undefined", collider, rigidBodyRef.value);
    }

    entity.add(ColliderRef, { value: collider });
  }

  remove(entity) {
    const { world } = this.world.physics;
    const colliderRef = entity.get(ColliderRef);

    world.removeCollider(colliderRef.value);
    entity.remove(ColliderRef);
  }
}
