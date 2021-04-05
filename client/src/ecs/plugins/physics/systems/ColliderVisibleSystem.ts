import { BufferGeometry, Mesh } from "three";
import { System, Groups, Not, Modified } from "~/ecs/base";
import { Collider, ColliderVisible, ColliderVisibleRef } from "../components";
import { Object3D } from "~/ecs/plugins/core";
import { colliderMaterial } from "~/ecs/shared/colliderMaterial";
import { getGeometry } from "~/ecs/plugins/shape/ShapeCache";

export class ColliderVisibleSystem extends System {
  order = Groups.Initialization;

  static queries = {
    added: [Object3D, Collider, ColliderVisible, Not(ColliderVisibleRef)],
    removed: [Object3D, Not(ColliderVisible), ColliderVisibleRef],
    modifiedCollider: [Object3D, Modified(Collider), ColliderVisible],
    removedCollider: [Object3D, Not(Collider), ColliderVisibleRef],
  };

  update() {
    // create new ColliderRef
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
    this.queries.modifiedCollider.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
      
      // Notify outline to rebuild if necessary
      entity.getByName("Outline")?.modified();
    });
    this.queries.removedCollider.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const collider = entity.get(Collider);
    const object3d = entity.get(Object3D).value;

    const geometry: BufferGeometry = getGeometry(colliderToShape(collider));

    const mesh = new Mesh(geometry, colliderMaterial);
    mesh.scale.multiplyScalar(0.99);
    mesh.position.copy(collider.offset);

    object3d.add(mesh);
    entity.add(ColliderVisibleRef, { value: mesh });
  }

  remove(entity) {
    const object3d = entity.get(Object3D).value;
    const mesh = entity.get(ColliderVisibleRef).value;

    object3d.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();

    entity.remove(ColliderVisibleRef);
  }
}

function colliderToShape(collider) {
  return {
    kind: collider.shape,
    boxSize: collider.boxSize,
    sphereRadius: collider.sphereRadius,
    sphereWidthSegments: 16,
    sphereHeightSegments: 12,
    cylinderRadius: collider.cylinderRadius,
    cylinderHeight: collider.cylinderHeight,
    cylinderSegments: 32,
    capsuleRadius: collider.capsuleRadius,
    capsuleHeight: collider.capsuleHeight,
    capsuleSegments: 16,
  };
}
