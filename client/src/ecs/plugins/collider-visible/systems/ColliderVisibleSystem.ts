import {
  BufferGeometry,
  Group,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  Vector3,
} from "three";
import { System, Groups, Not, Modified } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import {
  colliderMaterial,
  sensorMaterial,
} from "~/ecs/shared/colliderMaterial";
import { shapeParamsToGeometry, toShapeParams } from "~/ecs/shared/createShape";

import { Collider3, Collider3Active } from "~/ecs/plugins/collider";
import { NonInteractive } from "~/ecs/plugins/non-interactive";

import { ColliderVisibleRef } from "../components";

const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();
const _q1 = new Quaternion();

export class ColliderVisibleSystem extends System {
  order = Groups.Initialization;

  static enabled: boolean = false;

  static queries = {
    all: [ColliderVisibleRef],

    added: [
      Object3DRef,
      Collider3,
      Collider3Active,
      Not(NonInteractive),
      Not(ColliderVisibleRef),
    ],
    modified: [Object3DRef, Modified(Collider3), ColliderVisibleRef],
    modifiedTransform: [Object3DRef, Modified(Transform), ColliderVisibleRef],
    removed: [Object3DRef, Not(Collider3), ColliderVisibleRef],
    removedInteractive: [Object3DRef, NonInteractive, ColliderVisibleRef],
    deactivated: [Collider3, ColliderVisibleRef, Not(Collider3Active)],
  };

  update() {
    if (ColliderVisibleSystem.enabled) {
      this.queries.modified.forEach((entity) => this.remove(entity));
      this.queries.modifiedTransform.forEach((entity) => this.remove(entity));
      this.queries.added.forEach((entity) => this.build(entity));
      this.queries.removed.forEach((entity) => this.remove(entity));
      this.queries.removedInteractive.forEach((entity) => this.remove(entity));
      this.queries.deactivated.forEach((entity) => this.remove(entity));
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
  setGroupAndMeshTransform(entity) {
    const transform: Transform = entity.get(Transform);
    const collider: Collider3 = entity.get(Collider3);
    const ref: ColliderVisibleRef = entity.get(ColliderVisibleRef);

    if (!collider.autoscale) {
      ref.group.scale.set(
        1 / transform.scale.x,
        1 / transform.scale.y,
        1 / transform.scale.z
      );
    }

    ref.value.position.copy(collider.offset);
    ref.value.quaternion.copy(collider.rotation);

    // Slight adjustment to z fixes an issue with Fire:
    // - When both transparent objects are at precisely the same distance from the camera,
    //   the render order is indeterminate
    // - We force the ColliderVisible to by slightly "in front" so that both can be seen.
    ref.value.position.z += 0.001;
  }

  build(entity) {
    const collider: Collider3 = entity.get(Collider3);
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

    const group = new Group();
    group.add(mesh);

    // Render *after* any shape or model that is a child of our object3dref
    // (required for transparency to work properly)
    mesh.renderOrder = 1;

    object3dref.value.add(group);
    entity.add(ColliderVisibleRef, { value: mesh, group });

    // Notify dependencies (e.g. outlines) that object3d has changed
    object3dref.modified();

    this.setGroupAndMeshTransform(entity);
  }

  remove(entity) {
    const ref = entity.get(ColliderVisibleRef);

    ref.value.geometry.dispose();
    ref.value.removeFromParent();
    ref.group.removeFromParent();

    entity.remove(ColliderVisibleRef);
  }
}
