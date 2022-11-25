import type { Physics } from "~/ecs/plugins/physics";
import type { DecoratedECSWorld } from "~/types";

import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";

import { createCollider } from "../shared/createCollider";
import { createRigidBody } from "../shared/createRigidBody";
import { makeImplicitColliderParams } from "../shared/makeImplicitColliderParams";
import { ColliderParams } from "../shared/types";

import { ImplicitColliderRef, ImplicitColliderApplied } from "../components";

export class ImplicitColliderSystem extends System {
  physics: Physics;

  // Same order as ColliderSystem
  order = Groups.Presentation + 299;

  static queries = {
    added: [Transform, Object3DRef, Not(ImplicitColliderRef)],
    removed: [Not(Transform), ImplicitColliderApplied],
    modifiedObject: [Modified(Object3DRef), ImplicitColliderRef],
    modifiedTransform: [Modified(Transform), ImplicitColliderRef],
  };

  init({ physics }) {
    this.physics = physics;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.removed.forEach((entity) => {
      if (entity.destroying) {
        const applied: ImplicitColliderApplied = entity.get(
          ImplicitColliderApplied
        );
        if (applied.collider) this.physics.removeCollider(applied.collider);
        if (applied.body) this.physics.removeBody(applied.body);
      }
      entity.remove(ImplicitColliderApplied);
    });

    this.queries.modifiedObject.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.modifiedTransform.forEach((entity) => {
      this.modifiedTransform(entity);
    });
  }

  build(
    entity: Entity,
    params: ColliderParams = makeImplicitColliderParams(
      this.world as DecoratedECSWorld,
      entity
    )
  ) {
    const body = createRigidBody(this.physics, entity, params.spec.behavior);
    this.physics.addBody(body, entity);

    const collider = createCollider(this.physics, params, body);
    this.physics.addCollider(collider, entity);

    // Story body & collider so it can go on ice when off stage
    entity.add(ImplicitColliderRef, { body, collider, size: params.spec.size });

    // Store body & collider so we can remove when destroyed
    entity.add(ImplicitColliderApplied, {
      body,
      collider,
    });
  }

  remove(entity: Entity) {
    const ref: ImplicitColliderRef = entity.get(ImplicitColliderRef);

    if (ref.collider) this.physics.removeCollider(ref.collider);
    if (ref.body) this.physics.removeBody(ref.body);

    entity.remove(ImplicitColliderRef);
  }

  modifiedTransform(entity: Entity) {
    const transform: Transform = entity.get(Transform);
    const ref: ImplicitColliderRef = entity.get(ImplicitColliderRef);

    // Anticipate the need for PhysicsSystem to have an up-to-date translation
    // and rotation from a modified Transform
    ref.body.setTranslation(transform.position, false);
    ref.body.setRotation(transform.rotation, false);

    // When scaling an object that has an implicit collider, we need to
    // re-calculate the size of the collider since the collider is calculated
    // automatically
    // const implicit: ColliderImplicit = entity.get(ColliderImplicit);
    // if (implicit && !ref.size.equals(implicit.size)) {
    //   this.remove(entity);
    //   entity.add(ColliderImplicit, { size: ref.size });
    //   this.build(entity);
    // }
  }
}
