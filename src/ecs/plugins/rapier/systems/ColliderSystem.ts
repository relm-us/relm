import { System, Groups, Not, Modified } from "hecs";
import { RigidBodyRef, Collider, ColliderRef } from "../components";

export class ColliderSystem extends System {
  order = Groups.Initialization;

  static queries = {
    added: [Collider, Not(ColliderRef), RigidBodyRef],
    modified: [Modified(Collider), ColliderRef],
    removed: [Not(Collider), ColliderRef],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const spec = entity.get(Collider);
    const rigidBodyRef = entity.get(RigidBodyRef);
    const { world, rapier } = this.world.physics;

    // Create a cuboid collider attached to rigidBody.
    let colliderDesc;
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

    let collider = world.createCollider(
      colliderDesc,
      rigidBodyRef.value.handle
    );

    entity.add(ColliderRef, { value: collider });
  }

  remove(entity) {
    const { world } = this.world.physics;
    const colliderRef = entity.get(ColliderRef);

    world.removeCollider(colliderRef.value.handle);
  }
}
