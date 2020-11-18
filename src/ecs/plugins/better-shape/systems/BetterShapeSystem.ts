import { System, Not, Modified, Groups } from "hecs";
import { Object3D } from "hecs-plugin-three";
import * as THREE from "three";

import { isBrowser } from "~/utils/isBrowser";
import { BetterShape, BetterShapeMesh } from "../components";
import { CapsuleGeometry } from "../CapsuleGeometry";

export class BetterShapeSystem extends System {
  active = isBrowser();
  order = Groups.Initialization;

  static queries = {
    added: [Object3D, BetterShape, Not(BetterShapeMesh)],
    modified: [Object3D, Modified(BetterShape), BetterShapeMesh],
    removedObj: [Not(Object3D), BetterShapeMesh],
    removed: [Object3D, Not(BetterShape), BetterShapeMesh],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      const object3d = entity.get(Object3D).value;
      const mesh = entity.get(BetterShapeMesh).value;
      object3d.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.build(entity);
    });
    this.queries.removedObj.forEach((entity) => {
      const mesh = entity.get(BetterShapeMesh).value;
      mesh.parent.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      entity.remove(BetterShapeMesh);
    });
    this.queries.removed.forEach((entity) => {
      const object3d = entity.get(Object3D).value;
      const mesh = entity.get(BetterShapeMesh).value;
      object3d.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      entity.remove(BetterShapeMesh);
    });
  }

  getGeometry(shape) {
    switch (shape.kind) {
      case "BOX":
        return new THREE.BoxGeometry(
          shape.boxSize.x,
          shape.boxSize.y,
          shape.boxSize.z
        );
      case "SPHERE":
        return new THREE.SphereGeometry(
          shape.sphereRadius,
          shape.sphereWidthSegments,
          shape.sphereHeightSegments
        );
      case "CAPSULE":
        return CapsuleGeometry(
          shape.capsuleRadius,
          shape.capsuleHeight,
          shape.capsuleSegments * 4
        );
      default:
        throw new Error(`BetterShapeSystem: invalid shape.kind ${shape.kind}`);
    }
  }

  build(entity) {
    const shape = entity.get(BetterShape);
    const object3d = entity.get(Object3D).value;
    const geometry = this.getGeometry(shape);

    const material = new THREE.MeshStandardMaterial({
      color: shape.color,
      roughness: shape.roughness,
      metalness: shape.metalness,
      emissive: shape.emissive,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // mesh.material.envMap = this.envMap
    object3d.add(mesh);
    entity.add(BetterShapeMesh, { value: mesh });
  }
}
