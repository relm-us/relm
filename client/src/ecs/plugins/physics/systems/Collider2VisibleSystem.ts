import { BufferGeometry, Mesh, Object3D, Vector3 } from "three";
import { System, Groups, Not, Modified } from "~/ecs/base";
import { Collider2, ColliderVisible, Collider2VisibleRef } from "../components";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { colliderMaterial } from "~/ecs/shared/colliderMaterial";
import { shapeParamsToGeometry, toShapeParams } from "~/ecs/shared/createShape";

const _v3 = new Vector3();

export class Collider2VisibleSystem extends System {
  order = Groups.Initialization;

  static queries = {
    added: [Object3DRef, Collider2, ColliderVisible, Not(Collider2VisibleRef)],
    removed: [Object3DRef, Not(ColliderVisible), Collider2VisibleRef],
    modifiedCollider: [Object3DRef, Modified(Collider2), ColliderVisible],
    modifiedTransform: [Modified(Transform), Collider2VisibleRef],
    removedCollider: [Object3DRef, Not(Collider2), Collider2VisibleRef],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
    this.queries.modifiedCollider.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.modifiedTransform.forEach((entity) => {
      this.setInverseScale(entity);
    });
    this.queries.removedCollider.forEach((entity) => {
      this.remove(entity);
    });
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
  }

  build(entity) {
    const collider: Collider2 = entity.get(Collider2);
    const object3d: Object3D = entity.get(Object3DRef).value;

    const geometry: BufferGeometry = shapeParamsToGeometry(
      toShapeParams(collider.shape, collider.size, 0.25),
      0.04
    );

    const mesh = new Mesh(geometry, colliderMaterial);

    object3d.add(mesh);
    entity.add(Collider2VisibleRef, { value: mesh });

    this.setInverseScale(entity);
  }

  remove(entity) {
    const object3d: Object3D = entity.get(Object3DRef).value;
    const mesh = entity.get(Collider2VisibleRef).value;

    object3d.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();

    entity.remove(Collider2VisibleRef);
  }
}
