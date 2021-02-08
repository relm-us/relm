import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/three";
import * as THREE from "three";

import { isBrowser } from "~/utils/isBrowser";
import { BetterShape, BetterShapeMesh } from "../components";
import { CapsuleGeometry } from "../CapsuleGeometry";

const geometryCache: Map<string, any> = new Map();
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

  getCacheKeyForShape(shape) {
    let cacheKey = `${shape.kind}(`;
    switch (shape.kind) {
      case "BOX":
        cacheKey += `${shape.boxSize.x},${shape.boxSize.y},${shape.boxSize.y})`;
        break;
      case "SPHERE":
        cacheKey += `${shape.sphereRadius},${shape.sphereWidthSegments},${shape.sphereHeightSegments})`;
        break;
      case "CAPSULE":
        cacheKey += `${shape.capsuleRadius},${shape.capsuleHeight},${
          shape.capsuleSegments * 4
        })`;
        break;
    }
    return cacheKey;
  }

  getGeometry(shape) {
    const cacheKey = this.getCacheKeyForShape(shape);
    if (geometryCache.has(cacheKey)) {
      return geometryCache.get(cacheKey);
    }
    switch (shape.kind) {
      case "BOX":
        const box = new THREE.BoxBufferGeometry(
          shape.boxSize.x,
          shape.boxSize.y,
          shape.boxSize.z
        );
        geometryCache.set(cacheKey, box);
        return box;
      case "SPHERE":
        const sphere = new THREE.SphereBufferGeometry(
          shape.sphereRadius,
          shape.sphereWidthSegments,
          shape.sphereHeightSegments
        );
        geometryCache.set(cacheKey, sphere);
        return sphere;
      case "CAPSULE":
        const capsule = CapsuleGeometry(
          shape.capsuleRadius,
          shape.capsuleHeight,
          shape.capsuleSegments * 4
        );
        geometryCache.set(cacheKey, capsule);
        return capsule;
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
