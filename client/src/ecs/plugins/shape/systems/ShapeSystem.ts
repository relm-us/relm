import * as THREE from "three";

import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";

import { isBrowser } from "~/utils/isBrowser";
import { Shape, ShapeMesh } from "../components";
import { getGeometry } from "../ShapeCache";

export class ShapeSystem extends System {
  active = isBrowser();
  order = Groups.Initialization;

  static queries = {
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
      this.remove(entity);
      this.build(entity);

      // Notify outline to rebuild if necessary
      entity.getByName("Outline")?.modified();
    });
    this.queries.removedObj.forEach((entity) => {
      const mesh = entity.get(ShapeMesh).value;
      mesh.parent.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      entity.remove(ShapeMesh);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
      entity.remove(ShapeMesh);
    });
  }

  build(entity) {
    const shape = entity.get(Shape);
    const object3d = entity.get(Object3D).value;
    const geometry = getGeometry(shape);

    const material = new THREE.MeshStandardMaterial({
      color: shape.color,
      roughness: shape.roughness,
      metalness: shape.metalness,
      emissive: shape.emissive,
    });
    if (shape.kind === "CYLINDER" && shape.cylinderSegments <= 6) {
      material.flatShading = true;
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    object3d.add(mesh);
    entity.add(ShapeMesh, { value: mesh });
  }

  remove(entity) {
    const object3d = entity.get(Object3D).value;
    const mesh = entity.get(ShapeMesh).value;
    object3d.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();

    entity.remove(ShapeMesh);
  }
}
