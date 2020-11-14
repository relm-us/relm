import { System, Not, Modified, Groups } from "hecs";
import { Object3D } from "hecs-plugin-three";
import * as THREE from "three";

import { IS_BROWSER } from "../utils";
import { CssPlane, CssShapeMesh } from "../components";

export class CssPlaneSystem extends System {
  active = IS_BROWSER;
  order = Groups.Simulation + 99;

  static queries = {
    added: [Object3D, CssPlane, Not(CssShapeMesh)],
    // modified: [Object3D, Modified(CssPlane), ShapeMesh],
    // removedObj: [Not(Object3D), ShapeMesh],
    // removed: [Object3D, Not(CssPlane), ShapeMesh],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    // this.queries.modified.forEach((entity) => {
    //   const object3d = entity.get(Object3D).value;
    //   const mesh = entity.get(ShapeMesh).value;
    //   object3d.remove(mesh);
    //   mesh.geometry.dispose();
    //   mesh.material.dispose();
    //   this.build(entity);
    // });
    // this.queries.removedObj.forEach((entity) => {
    //   const mesh = entity.get(ShapeMesh).value;
    //   mesh.parent.remove(mesh);
    //   mesh.geometry.dispose();
    //   mesh.material.dispose();
    //   entity.remove(ShapeMesh);
    // });
    // this.queries.removed.forEach((entity) => {
    //   const object3d = entity.get(Object3D).value;
    //   const mesh = entity.get(ShapeMesh).value;
    //   object3d.remove(mesh);
    //   mesh.geometry.dispose();
    //   mesh.material.dispose();
    //   entity.remove(ShapeMesh);
    // });
  }

  build(entity) {
    // console.log("build", entity);
    const plane = entity.get(CssPlane);
    const object3d = entity.get(Object3D).value;
    // console.log("css plane object3d", object3d);

    let geometry;
    switch (plane.kind) {
      case "RECTANGLE":
        const size = plane.rectangleSize;
        // console.log("rectangle size", size);
        // geometry = new THREE.BoxGeometry(2, 2, 2);
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
}
