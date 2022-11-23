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
  Collider2,
  Collider2Ref,
  Collider2Implicit,
  PhysicsOptions,
  Collider2Explicit,
  Collider2Inactive,
} from "../components";

const _b3 = new Box3();

export class Collider2System extends System {
  physics: Physics;

  /**
   * If the Collider2 is modified in rapid succession (such as when
   * a designer is actively resizing a collider), then it's possible
   * the physics world will not yet include the newly re-built collider
   * in its calculation of what is "on stage" (i.e. within view of the
   * camera frustum). If the entity does not appear to be on stage, the
   * entity will be de-activated, and all ECS Components will be removed
   * (including the Collider2 being modified).
   *
   * Therefore, it's important that Collider2System occur after CameraSystem
   * and before PhysicsSystem.
   */
  order = Groups.Presentation + 299;

  static queries = {
    added: [Transform, Collider2, Not(Collider2Ref), Not(Collider2Inactive)],
    modified: [Transform, Modified(Collider2), Collider2Ref],

    // Since it's required for Collider2Ref to be a LocalComponent (in order
    // for the on-stage/off-stage magic to work in CameraSystem), we need
    // another way to detect if a collider is truly removed due to user
    // interaction or on-stage action. We use Collider2Explicit (a State-
    // Component) for this purpose.
    removed: [Not(Collider2), Collider2Explicit, Not(Collider2Implicit)],
    inactive: [Collider2, Collider2Ref, Collider2Inactive],

    addImplicit: [
      Transform,
      Object3DRef,
      Not(Collider2),
      Not(Collider2Ref),
      Not(Collider2Implicit),
    ],
    modifiedObject: [Transform, Modified(Object3DRef)],
    modifiedTransform: [Modified(Transform), Collider2Ref],
    implicitToExplicit: [Collider2, Collider2Implicit],
  };

  init({ physics }) {
    this.physics = physics;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity, true);
    });

    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.removed.forEach((entity) => {
      if (entity.destroying) {
        const ref: Collider2Explicit = entity.get(Collider2Explicit);
        if (ref.collider) this.physics.removeCollider(ref.collider);
        if (ref.body) this.physics.removeBody(ref.body);
      }
      entity.remove(Collider2Explicit);
    });
    this.queries.inactive.forEach((entity) => {
      const ref: Collider2Explicit = entity.get(Collider2Explicit);
      if (ref.collider) this.physics.removeCollider(ref.collider);
      if (ref.body) this.physics.removeBody(ref.body);

      entity.remove(Collider2Explicit);
    });

    this.queries.addImplicit.forEach((entity) => {
      entity.add(Collider2Implicit);
      this.build(entity);
    });
    this.queries.modifiedObject.forEach((entity) => {
      const isImplicit = entity.has(Collider2Implicit);
      this.remove(entity);
      if (isImplicit) entity.add(Collider2Implicit);
      this.build(entity);
    });

    this.queries.modifiedTransform.forEach((entity) => {
      this.modifiedTransform(entity);
    });

    this.queries.implicitToExplicit.forEach((entity) => {
      entity.remove(Collider2Implicit);
      entity.maybeRemove(Collider2Ref);
      this.build(entity);
    });
  }

  build(entity: Entity, explicit: boolean = false) {
    const transform: Transform = entity.get(Transform);
    let spec: Collider2 = entity.get(Collider2);

    // Implicit collider needs to have bounding box calculated
    let rotation = new Quaternion();
    let offset = new Vector3();
    if (!spec) {
      spec = new Collider2(this.world);
      const object3d: Object3D = entity.get(Object3DRef).value;

      _b3.setFromObject(object3d);
      _b3.getSize(spec.size);
      _b3.getCenter(offset).sub(transform.position);

      // The AABB needs to be inverted so that the usual rotation re-aligns it to the world axes
      rotation.copy(transform.rotation).invert();
    }

    const body = this.createRigidBody(entity, spec.behavior);
    this.physics.addBody(body, entity);

    const collider = this.createCollider(
      spec,
      body,
      rotation,
      offset,
      spec.behavior
    );
    this.physics.addCollider(collider, entity);

    entity.add(Collider2Ref, { body, collider, size: spec.size });

    if (explicit || entity.has(Collider2Explicit))
      entity.add(Collider2Explicit, { body, collider });
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
    collider: Collider2,
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
    const ref: Collider2Ref = entity.get(Collider2Ref);

    if (ref.collider) this.physics.removeCollider(ref.collider);
    if (ref.body) this.physics.removeBody(ref.body);

    entity.remove(Collider2Ref);
    entity.maybeRemove(Collider2Implicit);
  }

  modifiedTransform(entity: Entity) {
    const transform: Transform = entity.get(Transform);
    const ref: Collider2Ref = entity.get(Collider2Ref);

    // Anticipate the need for PhysicsSystem to have an up-to-date translation
    // and rotation from a modified Transform
    ref.body.setTranslation(transform.position, true);
    ref.body.setRotation(transform.rotation, true);

    // When scaling an object that has an implicit collider, we need to
    // re-calculate the size of the collider since the collider is calculated
    // automatically
    const implicit: Collider2Implicit = entity.get(Collider2Implicit);
    if (implicit && !ref.size.equals(implicit.size)) {
      this.remove(entity);
      entity.add(Collider2Implicit, { size: ref.size });
      this.build(entity);
    }
  }
}
