import { BufferGeometry, Mesh, Object3D, Vector3 } from "three";
import { System, Groups, Not, Modified } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import {
  colliderMaterial,
  sensorMaterial,
} from "~/ecs/shared/colliderMaterial";
import { shapeParamsToGeometry, toShapeParams } from "~/ecs/shared/createShape";

import { Collider2 } from "~/ecs/plugins/collider";
import { NonInteractive } from "~/ecs/plugins/non-interactive";

import { Collider2VisibleRef } from "../components";

const _v3 = new Vector3();

export class Collider2VisibleSystem extends System {
  order = Groups.Initialization;

  static enabled: boolean = false;

  static queries = {
    all: [Collider2VisibleRef],

    modified: [Object3DRef, Modified(Collider2), Collider2VisibleRef],
    modifiedTransform: [Object3DRef, Modified(Transform), Collider2VisibleRef],
    added: [
      Object3DRef,
      Collider2,
      // Not(Collider2Implicit),
      Not(NonInteractive),
      Not(Collider2VisibleRef),
    ],
    removed: [Object3DRef, Not(Collider2), Collider2VisibleRef],
    removedInteractive: [Object3DRef, NonInteractive, Collider2VisibleRef],
  };

  update() {
    if (Collider2VisibleSystem.enabled) {
      this.queries.modified.forEach((entity) => this.remove(entity));
      this.queries.modifiedTransform.forEach((entity) => this.remove(entity));
      this.queries.added.forEach((entity) => this.build(entity));
      this.queries.removed.forEach((entity) => this.remove(entity));
      this.queries.removedInteractive.forEach((entity) => this.remove(entity));
    } else {
      this.queries.all.forEach((entity) => {
        this.remove(entity);
      });
    }
  }

  // Set an inverse scale on the mesh to "undo" the scale transform;
  // We must do this because rapier physics colliders do not scale,
  // and this "visible" representation of the collider therefore must
  // not either.
  setInverseScale(entity) {
    const transform: Transform = entity.get(Transform);
    const collider: Collider2 = entity.get(Collider2);
    const ref: Collider2VisibleRef = entity.get(Collider2VisibleRef);
    ref.value.scale.set(
      1 / transform.scale.x,
      1 / transform.scale.y,
      1 / transform.scale.z
    );

    // "undo" the scaled offset as well
    _v3.copy(collider.offset).divide(transform.scale);
    ref.value.position.copy(_v3);

    // Slight adjustment to z fixes an issue with Fire:
    // - When both transparent objects are at precisely the same distance from the camera,
    //   the render order is indeterminate
    // - We force the Collider2Visible to by slightly "in front" so that both can be seen.
    ref.value.position.z += 0.001;
  }

  build(entity) {
    const collider: Collider2 = entity.get(Collider2);
    const object3dref: Object3DRef = entity.get(Object3DRef);

    const geometry: BufferGeometry = shapeParamsToGeometry(
      toShapeParams(collider.shape, collider.size, 0.25),
      0.04
    );

    const material = (
      collider.behavior.isSensor ? sensorMaterial : colliderMaterial
    ).clone();

    // Prevent `TranslucentSystem` from affecting the collider visualization
    material.userData.translucentImmune = true;

    const mesh = new Mesh(geometry, material);
    mesh.quaternion.copy(collider.rotation);

    // Render *after* any shape or model that is a child of our object3dref
    // (required for transparency to work properly)
    mesh.renderOrder = 1;

    object3dref.value.add(mesh);
    entity.add(Collider2VisibleRef, { value: mesh });

    // Notify dependencies (e.g. outlines) that object3d has changed
    object3dref.modified();

    this.setInverseScale(entity);
  }

  remove(entity) {
    const mesh = entity.get(Collider2VisibleRef).value;

    mesh.geometry.dispose();
    mesh.removeFromParent();

    entity.remove(Collider2VisibleRef);
  }
}
