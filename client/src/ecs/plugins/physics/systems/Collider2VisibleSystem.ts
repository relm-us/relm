import { BufferGeometry, Mesh, Object3D } from "three";
import { System, Groups, Not, Modified } from "~/ecs/base";
import { Collider2, ColliderVisible, Collider2VisibleRef } from "../components";
import { Object3DRef } from "~/ecs/plugins/core";
import { colliderMaterial } from "~/ecs/shared/colliderMaterial";
import {
  shapeParamsToGeometry,
  shapeToShapeParams,
} from "~/ecs/shared/createShape";

export class Collider2VisibleSystem extends System {
  order = Groups.Initialization;

  static queries = {
    added: [Object3DRef, Collider2, ColliderVisible, Not(Collider2VisibleRef)],
    removed: [Object3DRef, Not(ColliderVisible), Collider2VisibleRef],
    modifiedCollider: [Object3DRef, Modified(Collider2), ColliderVisible],
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
    this.queries.removedCollider.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const collider: Collider2 = entity.get(Collider2);
    const object3d: Object3D = entity.get(Object3DRef).value;

    const geometry: BufferGeometry = shapeParamsToGeometry(
      shapeToShapeParams(collider.shape, collider.size, 0.25),
      0.04
    );

    const mesh = new Mesh(geometry, colliderMaterial);
    mesh.position.copy(collider.offset);

    object3d.add(mesh);
    entity.add(Collider2VisibleRef, { value: mesh });
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
