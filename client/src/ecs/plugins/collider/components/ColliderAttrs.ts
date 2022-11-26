import { Entity, LocalComponent, NumberType, RefType } from "~/ecs/base";
import { Collider3 } from "./Collider3";
import { ColliderRef } from "./ColliderRef";
import { PhysicsOptions } from "./PhysicsOptions";

// Quick modifications that don't need full remove/build cycle
export class ColliderAttrs extends LocalComponent {
  density?: number;
  friction?: number;
  gravityScale?: number;
  angularDamping?: number;
  linearDamping?: number;

  /**
   * The following props need to be `RefType` so that `null` is
   * a valid value. Otherwise, every numeric propertiy will get
   * set to 0 (even if it was not intended).
   */
  static props = {
    density: { type: RefType },
    friction: { type: RefType },
    gravityScale: { type: RefType },
    angularDamping: { type: RefType },
    linearDamping: { type: RefType },
  };

  applyTo(entity: Entity) {
    const ref: ColliderRef = entity.get(ColliderRef);
    const spec: Collider3 = entity.get(Collider3);
    const options: PhysicsOptions = entity.get(PhysicsOptions);

    if (this.density != null) {
      spec.density = this.density;
      ref.collider.setDensity(this.density);
    }

    if (this.friction != null) {
      spec.friction = this.friction;
      ref.collider.setFriction(this.friction);
    }

    if (this.gravityScale != null) {
      options.gravityScale = this.gravityScale;
      ref.body.setGravityScale(this.gravityScale, false);
    }

    if (this.angularDamping != null) {
      options.angDamp = this.angularDamping;
      ref.body.setAngularDamping(this.angularDamping);
    }

    if (this.linearDamping != null) {
      options.linDamp = this.linearDamping;
      ref.body.setLinearDamping(this.linearDamping);
    }
  }
}

export function setColliderAttrs(
  entity: Entity,
  attrs: {
    density?: number;
    friction?: number;
    gravityScale?: number;
    angularDamping?: number;
    linearDamping?: number;
  }
) {
  const spec: Collider3 = entity.get(Collider3);
  const options: PhysicsOptions = entity.get(PhysicsOptions);

  let colliderAttrs: ColliderAttrs = entity.get(ColliderAttrs);
  if (!colliderAttrs)
    colliderAttrs = entity.add(ColliderAttrs, undefined, true);

  if (attrs.density != null && attrs.density !== spec.density) {
    colliderAttrs.density = attrs.density;
    colliderAttrs.modified();
  }

  if (attrs.friction != null && attrs.friction !== spec.friction) {
    colliderAttrs.friction = attrs.friction;
    colliderAttrs.modified();
  }

  if (
    attrs.gravityScale != null &&
    attrs.gravityScale !== options.gravityScale
  ) {
    colliderAttrs.gravityScale = attrs.gravityScale;
    colliderAttrs.modified();
  }

  if (
    attrs.angularDamping != null &&
    attrs.angularDamping !== options.angDamp
  ) {
    colliderAttrs.angularDamping = attrs.angularDamping;
    colliderAttrs.modified();
  }

  if (attrs.linearDamping != null && attrs.linearDamping !== options.linDamp) {
    colliderAttrs.linearDamping = attrs.linearDamping;
    colliderAttrs.modified();
  }
}
