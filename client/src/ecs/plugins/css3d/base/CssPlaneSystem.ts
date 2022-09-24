import {
  Object3D,
  PlaneGeometry,
  CircleGeometry,
  MeshBasicMaterial,
  Mesh,
  Shape,
  ShapeGeometry,
  NoBlending,
  DoubleSide,
  MathUtils,
} from "three";

import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import { worldUIMode } from "~/stores";

import { isBrowser } from "~/utils/isBrowser";
import { CssPlane, CssShapeMesh } from "../components";

export class CssPlaneSystem extends System {
  active = isBrowser();
  order = Groups.Simulation + 99;

  static queries = {
    added: [Object3DRef, CssPlane, Not(CssShapeMesh)],
    modified: [Object3DRef, Modified(CssPlane), CssShapeMesh],
    removed: [Not(CssPlane), CssShapeMesh],
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
    const size = plane.rectangleSize;
    const radius = plane.circleRadius;
    switch (plane.kind) {
      case "RECTANGLE":
        geometry = new PlaneGeometry(size.x, size.y);
        break;
      case "ROUNDED":
        const shape = new Shape();
        // prettier-ignore
        roundedRect(shape,
          -size.x / 2, -size.y / 2,
          size.x, size.y,
          radius
        );
        geometry = new ShapeGeometry(shape);
        break;
      case "CIRCLE":
        geometry = new CircleGeometry(
          radius,
          MathUtils.clamp(Math.floor(radius * 12), 24, 72)
        );
        break;
      default:
        throw new Error(`CssPlaneSystem: invalid plane.kind ${plane.kind}`);
    }

    const material = new MeshBasicMaterial({
      color: 0,
      opacity: 0,
      blending: NoBlending,
      side: DoubleSide,
      visible: plane.visible,
    });

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(plane.offset);
    mesh.userData.cssPlaneUnsub = worldUIMode.subscribe(($mode) => {
      if ($mode === "build") {
        material.visible = true;
      } else {
        material.visible = plane.visible;
      }
    });

    object3d.add(mesh);

    entity.add(CssShapeMesh, { value: mesh });

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    entity.get(Object3DRef).modified();
  }

  remove(entity) {
    const mesh = entity.get(CssShapeMesh).value;

    mesh.userData.cssPlaneUnsub?.();

    mesh.geometry.dispose();
    mesh.removeFromParent();

    entity.remove(CssShapeMesh);

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    entity.get(Object3DRef)?.modified();
  }
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
  ctx.lineTo(x + width - radius, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  ctx.lineTo(x + width, y + radius);
  ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
}
