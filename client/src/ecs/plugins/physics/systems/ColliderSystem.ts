import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { RigidBody, RigidBodyRef, Collider, ColliderRef } from "../components";
import { Transform, WorldTransform } from "~/ecs/plugins/core";
import { ColliderDesc as RapierColliderDesc } from "@dimforge/rapier3d";
import { createColliderShape } from "../createColliderShape";
import { Physics } from "../Physics";

export class ColliderSystem extends System {
  physics: Physics;

  order = Groups.Presentation + 250; // After WorldTransform

  static queries = {
    added: [Collider, Not(ColliderRef), RigidBodyRef],
    modifiedBody: [ColliderRef, Modified(RigidBody)],
    modifiedTransform: [ColliderRef, Modified(Transform)],
    modified: [Modified(Collider), RigidBodyRef],
    removed: [Not(Collider), ColliderRef],
  };

  init({ physics }) {
    this.physics = physics;
  }

  update() {
    // create new ColliderRef
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modifiedBody.forEach((entity) => {
      this.remove(entity);
    });
    this.queries.modifiedTransform.forEach((entity) => {
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

  build(entity: Entity) {
    const spec = entity.get(Collider);
    const rigidBodyRef = entity.get(RigidBodyRef);
    const colliderRef = entity.get(ColliderRef);
    const { world, rapier } = (this.world as any).physics;

    const worldTransform = entity.get(WorldTransform);

    const colliderDesc: RapierColliderDesc = createColliderShape(
      rapier,
      spec,
      worldTransform.scale
    );

    colliderDesc.setTranslation(
      spec.offset.x * worldTransform.scale.x,
      spec.offset.y * worldTransform.scale.y,
      spec.offset.z * worldTransform.scale.z
    );
    colliderDesc.setDensity(spec.density);
    colliderDesc.setCollisionGroups(spec.interaction);

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
