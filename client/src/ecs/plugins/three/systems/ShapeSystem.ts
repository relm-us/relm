import { System, Not, Modified, Groups } from "~/ecs/base";
import * as THREE from "three";

import { IS_BROWSER } from "../utils";
import { Shape, ShapeMesh, Object3D } from "../components";
import { CapsuleGeometry } from "../CapsuleGeometry";
import { Queries } from "~/ecs/base/Query";

export class ShapeSystem extends System {
  active = IS_BROWSER;
  order = Groups.Initialization;

  static queries: Queries = {
    added: [Object3D, Shape, Not(ShapeMesh)],
    modified: [Object3D, Modified(Shape), ShapeMesh],
    removedObj: [Not(Object3D), ShapeMesh],
    removed: [Object3D, Not(Shape), ShapeMesh],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      const object3d = entity.get(Object3D).value;
      const mesh = entity.get(ShapeMesh).value;
      object3d.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.build(entity);
    });
    this.queries.removedObj.forEach((entity) => {
      const mesh = entity.get(ShapeMesh).value;
      mesh.parent.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      entity.remove(ShapeMesh);
    });
    this.queries.removed.forEach((entity) => {
      const object3d = entity.get(Object3D).value;
      const mesh = entity.get(ShapeMesh).value;
      object3d.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      entity.remove(ShapeMesh);
    });
  }

  build(entity) {
    const shape = entity.get(Shape);
    const object3d = entity.get(Object3D).value;
    let geometry;
    if (shape.kind === "BOX") {
      geometry = new THREE.BoxGeometry(
        shape.boxSize.x,
        shape.boxSize.y,
        shape.boxSize.z
      );
    } else if (shape.kind === "SPHERE") {
      geometry = new THREE.SphereGeometry(
        shape.sphereRadius,
        shape.sphereWidthSegments,
        shape.sphereHeightSegments
      );
    } else if (shape.kind === "CAPSULE") {
      geometry = new CapsuleGeometry(
        shape.capsuleRadius,
        shape.capsuleHeight,
        shape.capsuleSegments * 4
      );
    } else {
      throw new Error(`ShapeSystem: invalid shape.kind ${shape.kind}`);
    }
    const material = new THREE.MeshStandardMaterial({
      color: shape.color,
      roughness: 0.8,
      metalness: 0,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // mesh.material.envMap = this.envMap
    object3d.add(mesh);
    entity.add(ShapeMesh, { value: mesh });
  }
}
