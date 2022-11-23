import { Object3D, Box3, Quaternion, Vector3 } from "three";

import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { Physics } from "~/ecs/plugins/physics";

import {
  Collider3,
  ImplicitColliderRef,
  ImplicitColliderApplied,
} from "../components";
import { createCollider } from "../shared/createCollider";
import { createRigidBody } from "../shared/createRigidBody";

type ColliderParams = {
  spec: Collider3;
  rotation: Quaternion;
  offset: Vector3;
};

const _b3 = new Box3();

export class ImplicitColliderSystem extends System {
  physics: Physics;

  // Same order as ColliderSystem
  order = Groups.Presentation + 299;

  static queries = {
    added: [Object3DRef, Not(ImplicitColliderRef), Transform],
    removed: [Not(Object3DRef), ImplicitColliderApplied],
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
    params: ColliderParams = this.makeImplicitColliderParams(entity)
  ) {
    const body = createRigidBody(this.physics, entity, params.spec.behavior);
    this.physics.addBody(body, entity);

    const collider = createCollider(
      this.physics,
      params.spec,
      body,
      params.rotation,
      params.offset,
      params.spec.behavior
    );
    this.physics.addCollider(collider, entity);

    // Story body & collider so it can go on ice when off stage
    entity.add(ImplicitColliderRef, { body, collider, size: params.spec.size });

    // Store body & collider so we can remove when destroyed
    entity.add(ImplicitColliderApplied, {
      body,
      collider,
    });
  }

  makeImplicitColliderParams(entity: Entity): ColliderParams {
    const transform: Transform = entity.get(Transform);

    let rotation = new Quaternion();
    let offset = new Vector3();

    // We only use Collider3 transiently here; it is not added as a Component
    const spec = new Collider3(this.world);
    const object3d: Object3D = entity.get(Object3DRef).value;

    _b3.setFromObject(object3d);
    _b3.getSize(spec.size);
    _b3.getCenter(offset).sub(transform.position);

    // The AABB needs to be inverted so that the usual rotation re-aligns it to the world axes
    rotation.copy(transform.rotation).invert();

    return { spec, rotation, offset };
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
    ref.body.setTranslation(transform.position, true);
    ref.body.setRotation(transform.rotation, true);

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
