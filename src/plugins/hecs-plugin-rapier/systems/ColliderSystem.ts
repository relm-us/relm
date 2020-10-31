import { System, Groups, Not, Modified } from "hecs";
import { ComposableTransform } from "hecs-plugin-composable";
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
  }

  build(entity) {
    const spec = entity.get(Collider);
    const rigidBodyRef = entity.get(RigidBodyRef);
    const { world } = this.world.physics;

    // Create a cuboid collider attached to rigidBody.
    let colliderDesc;
    switch (spec.shape) {
      case "BOX":
        const size = spec.boxSize;
        colliderDesc = RAPIER.ColliderDesc.cuboid(
          size.x / 2,
          size.y / 2,
          size.z / 2
        );
        break;
      case "SPHERE":
        colliderDesc = RAPIER.ColliderDesc.ball(spec.sphereRadius);
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
}
