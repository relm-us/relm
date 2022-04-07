import { ColliderDesc } from "@dimforge/rapier3d";

import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { Query } from "~/ecs/base/Query";

import { createColliderShape } from "../createColliderShape";
import { Physics } from "../Physics";
import { RigidBody, RigidBodyRef, Collider, ColliderRef } from "../components";

type QueryKeys =
  | "removedBody"
  | "modifiedBody"
  | "added"
  | "modified"
  | "removed";

export class ColliderSystem extends System {
  physics: Physics;
  queries: Record<QueryKeys, Query>;

  order = Groups.Presentation + 301; // After WorldTransform

  static queries: Record<QueryKeys, any[]> = {
    removedBody: [ColliderRef, Not(RigidBody)],
    modifiedBody: [ColliderRef, Modified(RigidBody)],
    added: [Collider, Not(ColliderRef), RigidBodyRef],
    modified: [Modified(Collider), RigidBodyRef],
    removed: [Not(Collider), ColliderRef],
  };

  init({ physics }) {
    this.physics = physics;
  }

  update() {
    // If rigidbody is removed or modified, re-create the collider
    this.queries.removedBody.forEach((entity) => this.remove(entity));
    this.queries.modifiedBody.forEach((entity) => this.remove(entity));

    // create new ColliderRef
    this.queries.added.forEach((entity) => this.build(entity));

    // replace ColliderRef with new spec
    this.queries.modified.forEach((entity) => this.build(entity));

    // Remove ColliderRef
    this.queries.removed.forEach((entity) => this.remove(entity));
  }

  build(entity: Entity) {
    const spec = entity.get(Collider);
    const rigidBodyRef = entity.get(RigidBodyRef);
    const { world, rapier } = (this.world as any).physics;

    const transform = entity.get(Transform);

    const colliderDesc: ColliderDesc = createColliderShape(
      rapier,
      spec,
      transform.scale
    )
      .setActiveCollisionTypes(
        rapier.ActiveCollisionTypes.DEFAULT |
          // Participant is Dynamic, portals etc. are Static
          rapier.ActiveCollisionTypes.DYNAMIC_STATIC
      )
      .setActiveEvents(
        // Impact with non-sensors
        rapier.ActiveEvents.CONTACT_EVENTS |
          // Impact with sensors
          rapier.ActiveEvents.INTERSECTION_EVENTS
      )
      .setTranslation(
        spec.offset.x * transform.scale.x,
        spec.offset.y * transform.scale.y,
        spec.offset.z * transform.scale.z
      )
      .setSensor(spec.isSensor)
      .setDensity(spec.density)
      .setCollisionGroups(spec.interaction);

    const colliderRef = entity.get(ColliderRef);
    if (colliderRef) {
      world.removeCollider(colliderRef.value);
      this.physics.handleToEntity.delete(colliderRef.value.handle);
    }

    let collider = world.createCollider(
      colliderDesc,
      rigidBodyRef.value.handle
    );
    if (collider.handle === undefined) {
      console.error("Collider handle undefined", collider, rigidBodyRef.value);
    } else {
      this.physics.handleToEntity.set(collider.handle, entity);
    }

    entity.add(ColliderRef, { value: collider });
  }

  remove(entity) {
    const { world } = (this.world as any).physics;
    const colliderRef = entity.get(ColliderRef);

    world.removeCollider(colliderRef.value);
    this.physics.handleToEntity.delete(colliderRef.value.handle);
    entity.remove(ColliderRef);
  }
}
