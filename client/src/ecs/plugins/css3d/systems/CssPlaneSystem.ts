import {
  Object3D,
  PlaneGeometry,
  CircleGeometry,
  MeshBasicMaterial,
  Mesh,
  NoBlending,
  DoubleSide,
} from "three";

import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";

import { isBrowser } from "~/utils/isBrowser";
import { CssPlane, CssShapeMesh } from "../components";

export class CssPlaneSystem extends System {
  active = isBrowser();
  order = Groups.Simulation + 99;

  static queries = {
    added: [Object3DRef, CssPlane, Not(CssShapeMesh)],
    modified: [Object3DRef, Modified(CssPlane), CssShapeMesh],
    removed: [Object3DRef, Not(CssPlane), CssShapeMesh],
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

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const plane = entity.get(CssPlane);
    const object3d: Object3D = entity.get(Object3DRef).value;

    let geometry;
    switch (plane.kind) {
      case "RECTANGLE":
        const size = plane.rectangleSize;
        geometry = new PlaneGeometry(size.x, size.y);
        break;
      case "CIRCLE":
        const radius = plane.circleRadius;
        geometry = new CircleGeometry(radius, 32);
        break;
      default:
        throw new Error(`CssPlaneSystem: invalid plane.kind ${plane.kind}`);
    }

    const material = new MeshBasicMaterial({
      color: 0,
      opacity: 0,
      blending: NoBlending,
      side: DoubleSide,
    });

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    object3d.add(mesh);

    entity.add(CssShapeMesh, { value: mesh });

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    entity.get(Object3DRef).modified();
  }

  remove(entity) {
    const object3dref = entity.get(Object3DRef);
    const mesh = entity.get(CssShapeMesh).value;

    mesh.geometry.dispose();
    mesh.material.dispose();
    object3dref.value.remove(mesh);

    entity.remove(CssShapeMesh);

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    object3dref.modified();
  }
}
