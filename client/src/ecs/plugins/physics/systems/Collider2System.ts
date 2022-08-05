import type {
  ColliderDesc,
  RigidBody,
  RigidBodyDesc,
} from "@dimforge/rapier3d";

import type { DecoratedECSWorld } from "~/types";

import { Object3D, MathUtils, Box3, Quaternion } from "three";

import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import {
  shapeParamsToColliderDesc,
  toShapeParams,
} from "~/ecs/shared/createShape";

import { Physics } from "../Physics";
import {
  Collider2,
  Collider2Ref,
  Collider2Implicit,
  PhysicsOptions,
} from "../components";
import { Behavior } from "../components/Collider2";

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
    implicitToExplicit: [Collider2, Collider2Implicit],

    added: [Transform, Collider2, Not(Collider2Ref)],
    modified: [Transform, Modified(Collider2), Collider2Ref],
    removed: [Transform, Not(Collider2), Collider2Ref, Not(Collider2Implicit)],

    addImplicit: [
      Transform,
      Object3DRef,
      Not(Collider2),
      Not(Collider2Implicit),
    ],
    modifiedImplicit: [Transform, Modified(Object3DRef), Collider2Implicit],
  };

  init({ physics }) {
    this.physics = physics;
  }

  update() {
    this.queries.implicitToExplicit.forEach((entity) => {
      entity.remove(Collider2Implicit);
      entity.maybeRemove(Collider2Ref);
    });

    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });

    this.queries.addImplicit.forEach((entity) => {
      entity.add(Collider2Implicit);
      this.build(entity);
    });
    this.queries.modifiedImplicit.forEach((entity) => {
      this.remove(entity);
      entity.add(Collider2Implicit);
      this.build(entity);
    });
  }

  build(entity: Entity) {
    const transform: Transform = entity.get(Transform);
    let spec: Collider2 = entity.get(Collider2);

    // Implicit collider needs to have bounding box calculated
    let rotation: Quaternion = new Quaternion();
    if (!spec) {
      spec = new Collider2(this.world);
      const object3d: Object3D = entity.get(Object3DRef).value;

      _b3.setFromObject(object3d);
      _b3.getSize(spec.size);

      // The AABB needs to be inverted so that the usual rotation re-aligns it to the world axes
      rotation.copy(transform.rotation).invert();
    }

    const body = this.createRigidBody(entity, spec.behavior);
    this.physics.bodies.set(body.handle, entity);

    const collider = this.createCollider(spec, body, rotation, spec.behavior);
    this.physics.colliders.set(collider.handle, entity);

    entity.add(Collider2Ref, { body, collider });
  }

  createRigidBody(entity: Entity, behavior: Behavior) {
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
    behavior: Behavior
  ) {
    const { world, rapier } = (this.world as any).physics;

    const colliderDesc: ColliderDesc = shapeParamsToColliderDesc(
      rapier,
      toShapeParams(collider.shape, collider.size)
    )
      .setActiveCollisionTypes(rapier.ActiveCollisionTypes.ALL)
      .setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS)
      .setTranslation(collider.offset.x, collider.offset.y, collider.offset.z)
      .setRotation(rotation.multiply(collider.rotation))
      .setDensity(MathUtils.clamp(collider.density, 0, 1000))
      .setFriction(collider.friction)
      .setCollisionGroups(behavior.interaction);

    // .setSensor(spec.isSensor);

    // Create the collider, and (optionally) attach to rigid body

    return world.createCollider(colliderDesc, body);
  }

  remove(entity) {
    const { world } = (this.world as DecoratedECSWorld).physics;
    const ref: Collider2Ref = entity.get(Collider2Ref);

    world.removeCollider(ref.collider, false);
    this.physics.colliders.delete(ref.collider.handle);

    if (ref.body) {
      world.removeRigidBody(ref.body);
      this.physics.bodies.delete(ref.body.handle);
    }

    entity.remove(Collider2Ref);
    entity.maybeRemove(Collider2Implicit);
  }
}
