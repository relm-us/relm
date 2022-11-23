import type {
  Collider,
  ColliderDesc,
  RigidBody,
  RigidBodyDesc,
} from "@dimforge/rapier3d";

import { Object3D, MathUtils, Box3, Quaternion, Vector3 } from "three";

import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { Physics } from "~/ecs/plugins/physics";
import {
  shapeParamsToColliderDesc,
  toShapeParams,
} from "~/ecs/shared/createShape";

import {
  Behavior,
  Collider3,
  ColliderRef,
  Collider3Active,
  ColliderImplicit,
  ColliderExplicit,
  PhysicsOptions,
} from "../components";

type ColliderParams = {
  spec: Collider3;
  rotation: Quaternion;
  offset: Vector3;
};

const _b3 = new Box3();

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

    // Since it's required for ColliderRef to be a LocalComponent (in order
    // for the on-stage/off-stage magic to work in CameraSystem), we need
    // another way to detect if a collider is truly removed due to user
    // interaction or on-stage action. We use ColliderExplicit (a State-
    // Component) for this purpose.
    removed: [Not(Collider3), ColliderExplicit, Not(ColliderImplicit)],
    deactivated: [ColliderRef, ColliderExplicit, Not(Collider3Active)],

    addImplicit: [
      Transform,
      Object3DRef,
      Not(Collider3),
      Not(ColliderRef),
      Not(ColliderImplicit),
    ],
    modifiedObject: [Transform, ColliderRef, Modified(Object3DRef)],
    modifiedTransform: [Modified(Transform), ColliderRef],
    implicitToExplicit: [Collider3, Collider3Active, ColliderImplicit],
  };

  init({ physics }) {
    this.physics = physics;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity, this.makeExplicitColliderParams(entity));

      const ref: ColliderRef = entity.get(ColliderRef);
      entity.add(ColliderExplicit, { body: ref.body, collider: ref.collider });
    });

    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.removed.forEach((entity) => {
      if (entity.destroying) {
        const ref: ColliderExplicit = entity.get(ColliderExplicit);
        if (ref.collider) this.physics.removeCollider(ref.collider);
        if (ref.body) this.physics.removeBody(ref.body);
      }
      entity.remove(ColliderExplicit);
    });

    this.queries.deactivated.forEach((entity) => {
      entity.remove(ColliderExplicit);
      this.remove(entity);

      entity.add(ColliderImplicit);
      this.build(entity, this.makeImplicitColliderParams(entity));
    });

    this.queries.addImplicit.forEach((entity) => {
      entity.add(ColliderImplicit);
      this.build(entity);
    });
    this.queries.modifiedObject.forEach((entity) => {
      const isImplicit = entity.has(ColliderImplicit);
      this.remove(entity);
      if (isImplicit) entity.add(ColliderImplicit);
      this.build(entity);
    });

    this.queries.modifiedTransform.forEach((entity) => {
      this.modifiedTransform(entity);
    });

    this.queries.implicitToExplicit.forEach((entity) => {
      entity.remove(ColliderImplicit);
      entity.maybeRemove(ColliderRef);
      this.build(entity);
    });
  }

  build(
    entity: Entity,
    params: ColliderParams = this.makeColliderParams(entity)
  ) {
    const body = this.createRigidBody(entity, params.spec.behavior);
    this.physics.addBody(body, entity);

    const collider = this.createCollider(
      params.spec,
      body,
      params.rotation,
      params.offset,
      params.spec.behavior
    );
    this.physics.addCollider(collider, entity);

    entity.add(ColliderRef, { body, collider, size: params.spec.size });
  }

  makeColliderParams(entity: Entity): ColliderParams {
    const spec: Collider3 = entity.get(Collider3);
    if (spec) return this.makeExplicitColliderParams(entity);
    else return this.makeImplicitColliderParams(entity);
  }

  makeImplicitColliderParams(entity: Entity): ColliderParams {
    const transform: Transform = entity.get(Transform);

    let rotation = new Quaternion();
    let offset = new Vector3();

    const spec = new Collider3(this.world);
    const object3d: Object3D = entity.get(Object3DRef).value;

    _b3.setFromObject(object3d);
    _b3.getSize(spec.size);
    _b3.getCenter(offset).sub(transform.position);

    // The AABB needs to be inverted so that the usual rotation re-aligns it to the world axes
    rotation.copy(transform.rotation).invert();

    return { spec, rotation, offset };
  }

  makeExplicitColliderParams(entity: Entity): ColliderParams {
    const spec: Collider3 = entity.get(Collider3);
    return { spec, rotation: new Quaternion(), offset: new Vector3() };
  }

  createRigidBody(entity: Entity, behavior: Behavior): RigidBody {
    const { world, rapier } = (this.world as any).physics;
    const transform = entity.get(Transform);

    const options: PhysicsOptions =
      entity.get(PhysicsOptions) || new PhysicsOptions(world);
    const rr = options.rotRestrict.toUpperCase();

    let bodyDesc: RigidBodyDesc = new rapier.RigidBodyDesc(behavior.bodyType)
      .setTranslation(
        transform.position.x,
        transform.position.y,
        transform.position.z
      )
      .setRotation(transform.rotation)
      .setAdditionalMass(options.additionalMass)
      .setLinearDamping(options.linDamp)
      .setAngularDamping(options.angDamp)
      .restrictRotations(rr.includes("X"), rr.includes("Y"), rr.includes("Z"));

    return world.createRigidBody(bodyDesc);
  }

  createCollider(
    collider: Collider3,
    body: RigidBody,
    rotation: Quaternion,
    offset: Vector3,
    behavior: Behavior
  ): Collider {
    const { world, rapier } = (this.world as any).physics;

    const colliderDesc: ColliderDesc = shapeParamsToColliderDesc(
      rapier,
      toShapeParams(collider.shape, collider.size)
    )
      .setActiveCollisionTypes(rapier.ActiveCollisionTypes.ALL)
      .setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS)
      .setTranslation(
        offset.x + collider.offset.x,
        offset.y + collider.offset.y,
        offset.z + collider.offset.z
      )
      .setRotation(rotation.multiply(collider.rotation))
      .setDensity(MathUtils.clamp(collider.density, 0, 1000))
      .setFriction(collider.friction)
      .setSensor(behavior.isSensor)
      .setCollisionGroups(behavior.interaction);

    return world.createCollider(colliderDesc, body);
  }

  remove(entity: Entity) {
    const ref: ColliderRef = entity.get(ColliderRef);

    if (ref.collider) this.physics.removeCollider(ref.collider);
    if (ref.body) this.physics.removeBody(ref.body);

    entity.remove(ColliderRef);
    entity.maybeRemove(ColliderImplicit);
  }

  modifiedTransform(entity: Entity) {
    const transform: Transform = entity.get(Transform);
    const ref: ColliderRef = entity.get(ColliderRef);

    // Anticipate the need for PhysicsSystem to have an up-to-date translation
    // and rotation from a modified Transform
    ref.body.setTranslation(transform.position, true);
    ref.body.setRotation(transform.rotation, true);

    // When scaling an object that has an implicit collider, we need to
    // re-calculate the size of the collider since the collider is calculated
    // automatically
    const implicit: ColliderImplicit = entity.get(ColliderImplicit);
    if (implicit && !ref.size.equals(implicit.size)) {
      this.remove(entity);
      entity.add(ColliderImplicit, { size: ref.size });
      this.build(entity);
    }
  }
}
