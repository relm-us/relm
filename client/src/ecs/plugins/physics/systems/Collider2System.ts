import type {
  ColliderDesc,
  RigidBody,
  RigidBodyDesc,
  RigidBodyType,
} from "@dimforge/rapier3d";

import { MathUtils } from "three";

import {
  GROUND_INTERACTION,
  OBJECT_INTERACTION,
} from "~/config/colliderInteractions";

import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";

import { Physics } from "../Physics";
import { Collider2, Collider2Ref, PhysicsOptions } from "../components";
import {
  shapeParamsToColliderDesc,
  shapeToShapeParams,
} from "~/ecs/shared/createShape";
import { DecoratedECSWorld } from "~/types";

type Behavior = {
  interaction: number;
  bodyType: RigidBodyType;
};

export class Collider2System extends System {
  physics: Physics;

  order = Groups.Presentation + 301; // After WorldTransform

  static queries = {
    added: [Collider2, Not(Collider2Ref)],
    modified: [Modified(Collider2), Collider2Ref],
    removed: [Not(Collider2), Collider2Ref],
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

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec: Collider2 = entity.get(Collider2);
    const behavior = this.getBehavior(spec.kind);

    let body;
    if (spec.kind !== "ETHEREAL") {
      body = this.createRigidBody(entity, behavior);
      this.physics.bodies.set(body.handle, entity);
    }

    const collider = this.createCollider(entity, body, behavior);
    this.physics.colliders.set(collider.handle, entity);

    entity.add(Collider2Ref, { body, collider });
  }

  createCollider(entity: Entity, body: RigidBody, behavior: Behavior) {
    const spec: Collider2 = entity.get(Collider2);
    const { world, rapier } = (this.world as any).physics;

    const transform = entity.get(Transform);

    const colliderDesc: ColliderDesc = shapeParamsToColliderDesc(
      rapier,
      shapeToShapeParams(spec.shape, spec.size)
    );

    colliderDesc.setActiveCollisionTypes(rapier.ActiveCollisionTypes.ALL);
    colliderDesc.setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS);

    colliderDesc.setTranslation(
      spec.offset.x * transform.scale.x,
      spec.offset.y * transform.scale.y,
      spec.offset.z * transform.scale.z
    );
    // colliderDesc.setSensor(spec.isSensor);
    colliderDesc.setDensity(MathUtils.clamp(spec.density, 0, 1000));

    // Create the collider, and (optionally) attach to rigid body
    if (body && behavior.interaction) {
      colliderDesc.setCollisionGroups(behavior.interaction);
      return world.createCollider(colliderDesc, body);
    } else {
      return world.createCollider(colliderDesc);
    }
  }

  createRigidBody(entity: Entity, behavior: Behavior) {
    const { world, rapier } = (this.world as any).physics;
    const transform = entity.get(Transform);

    let bodyDesc: RigidBodyDesc = new rapier.RigidBodyDesc(behavior.bodyType)
      .setTranslation(
        transform.position.x,
        transform.position.y,
        transform.position.z
      )
      .setRotation(transform.rotation);

    let options: PhysicsOptions =
      entity.get(PhysicsOptions) || new PhysicsOptions(world);

    bodyDesc.setLinearDamping(options.linDamp);
    bodyDesc.setAngularDamping(options.angDamp);

    const rr = options.rotRestrict.toUpperCase();
    bodyDesc.restrictRotations(
      !rr.includes("X"),
      !rr.includes("Y"),
      !rr.includes("Z")
    );

    // if (spec.mass) rigidBodyDesc.setAdditionalMass(spec.mass);

    return world.createRigidBody(bodyDesc);
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
  }

  getBehavior(kind: Collider2["kind"]): Behavior {
    const BodyType = this.physics.rapier.RigidBodyType;

    switch (kind) {
      case "ETHEREAL":
        return { interaction: null, bodyType: BodyType.Fixed };
      case "SOLID":
        return { interaction: OBJECT_INTERACTION, bodyType: BodyType.Fixed };
      case "GROUND":
        return { interaction: GROUND_INTERACTION, bodyType: BodyType.Fixed };
      case "DYNAMIC":
        return { interaction: OBJECT_INTERACTION, bodyType: BodyType.Dynamic };
    }
  }
}
