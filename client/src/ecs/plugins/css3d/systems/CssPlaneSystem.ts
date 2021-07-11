import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import * as THREE from "three";

import { isBrowser } from "~/utils/isBrowser";
import { CssPlane, CssShapeMesh } from "../components";

export class CssPlaneSystem extends System {
  active = isBrowser();
  order = Groups.Simulation + 99;

  static queries = {
    added: [Object3D, CssPlane, Not(CssShapeMesh)],
    modified: [Object3D, Modified(CssPlane), CssShapeMesh],
    // removedObj: [Not(Object3D), ShapeMesh],
    removed: [Object3D, Not(CssPlane), CssShapeMesh],
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

    // this.queries.removedObj.forEach((entity) => {
    //   const mesh = entity.get(ShapeMesh).value;
    //   mesh.parent.remove(mesh);
    //   mesh.geometry.dispose();
    //   mesh.material.dispose();
    //   entity.remove(ShapeMesh);
    // });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    })
  }

  build(entity) {
    const plane = entity.get(CssPlane);
    const object3d = entity.get(Object3D).value;

    let geometry;
    switch (plane.kind) {
      case "RECTANGLE":
        const size = plane.rectangleSize;
        geometry = new THREE.PlaneGeometry(size.x, size.y);
        break;
      case "CIRCLE":
        const radius = plane.circleRadius;
        geometry = new THREE.CircleGeometry(radius, 32);
        break;
      default:
        throw new Error(`CssPlaneSystem: invalid plane.kind ${plane.kind}`);
    }

    const material = new THREE.MeshBasicMaterial({
      color: 0,
      opacity: 0,
      blending: THREE.NoBlending,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    object3d.add(mesh);

    entity.add(CssShapeMesh, { value: mesh });
  }

  remove(entity) {
    const object3d = entity.get(Object3D).value;
    const mesh = entity.get(CssShapeMesh).value;

    mesh.geometry.dispose();
    mesh.material.dispose();
    object3d.remove(mesh);
    
    entity.remove(CssShapeMesh);
  }
}
