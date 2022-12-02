import type { ColliderParams } from "../shared/types";

import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { Physics } from "~/ecs/plugins/physics";

import {
  Collider3,
  ColliderRef,
  Collider3Active,
  ColliderAttrs,
} from "../components";
import { createCollider } from "../shared/createCollider";
import { createRigidBody } from "../shared/createRigidBody";
import { makeExplicitColliderParams } from "../shared/makeExplicitColliderParams";

export class ColliderSystem extends System {
  physics: Physics;

  /**
   * If the Collider3 is modified in rapid succession (such as when
   * a designer is actively resizing a collider), then it's possible
   * the physics world will not yet include the newly re-built collider
   * in its calculation of what is "on stage" (i.e. within view of the
   * camera frustum). If the entity does not appear to be on stage, the
   * entity will be de-activated, and all ECS Components will be removed
   * (including the Collider3 being modified).
   *
   * Therefore, it's important that Collider3System occur after CameraSystem
   * and before PhysicsSystem.
   */
  order = Groups.Presentation + 299;

  static queries = {
    added: [Transform, Collider3, Collider3Active, Not(ColliderRef)],
    modified: [Transform, Modified(Collider3), ColliderRef],
    modifiedAttrs: [Transform, Modified(ColliderAttrs), ColliderRef],
    modifiedObject: [Transform, ColliderRef, Modified(Object3DRef)],
    modifiedTransform: [Modified(Transform), ColliderRef],
    removed: [Not(Collider3), ColliderRef],
    deactivated: [ColliderRef, Not(Collider3Active)],
  };

  init({ physics }) {
    this.physics = physics;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.modifiedAttrs.forEach((entity) => {
      const attrs = entity.get(ColliderAttrs);
      attrs.applyTo(entity);
    });

    this.queries.modifiedObject.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.modifiedTransform.forEach((entity) => {
      this.modifiedTransform(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });

    this.queries.deactivated.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(
    entity: Entity,
    params: ColliderParams = makeExplicitColliderParams(entity)
  ) {
    const body = createRigidBody(this.physics, entity, params.spec.behavior);
    this.physics.addBody(body, entity);

    const collider = createCollider(this.physics, params, body);
    this.physics.addCollider(collider, entity);

    entity.add(ColliderRef, { body, collider, size: params.spec.size });
  }

  remove(entity: Entity) {
    const ref: ColliderRef = entity.get(ColliderRef);

    if (ref.collider) this.physics.removeCollider(ref.collider);
    if (ref.body) this.physics.removeBody(ref.body);

    entity.remove(ColliderRef);
  }

  modifiedTransform(entity: Entity) {
    const transform: Transform = entity.get(Transform);
    const spec: Collider3 = entity.get(Collider3);
    const ref: ColliderRef = entity.get(ColliderRef);

    // Anticipate the need for PhysicsSystem to have an up-to-date translation
    // and rotation from a modified Transform
    ref.body.setTranslation(transform.position, true);
    ref.body.setRotation(transform.rotation, true);

    // When scaling an object, we need to
    // re-calculate the size of the collider since the collider is calculated
    // automatically
    // const implicit: ColliderImplicit = entity.get(ColliderImplicit);
    // if (!ref.size.equals(spec.size)) {
    // console.log("resized via modifiedTransform");
    // this.remove(entity);
    // this.build(entity);
    // entity.get(Object3DRef).modified();
    // }
  }
}
