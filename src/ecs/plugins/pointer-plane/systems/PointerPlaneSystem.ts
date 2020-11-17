import { System, Groups } from "hecs";
import { WorldTransform, Transform } from "hecs-plugin-core";

import { get } from "svelte/store";
import { mouse } from "~/world/mouse";

import { PointerPlane } from "../components";
import {
  PlaneBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  DoubleSide,
  Raycaster,
  Euler,
} from "three";

export class PointerPlaneSystem extends System {
  order = Groups.Initialization + 10;

  static queries = {
    default: [PointerPlane, WorldTransform],
  };

  init({ presentation }) {
    this.presentation = presentation;
    this.raycaster = new Raycaster();
    this._intersections = [];
  }

  update() {
    const coords = get(mouse);

    this.queries.default.forEach((entity) => {
      this.findIntersections(entity, coords);
    });
  }

  findIntersections(entity, coords) {
    const transform = entity.get(Transform);
    const world = entity.get(WorldTransform);

    const pointerPlane = entity.get(PointerPlane);
    if (!pointerPlane.planes) {
      pointerPlane.planes = [];
    }

    if (!pointerPlane.xyPlane) {
      pointerPlane.xyPlane = this.createPlane("XY");
      pointerPlane.XY = new Vector3();
      pointerPlane.planes.push(pointerPlane.xyPlane);
    }
    pointerPlane.xyPlane.position.copy(world.position);

    if (!pointerPlane.xzPlane) {
      pointerPlane.xzPlane = this.createPlane("XZ");
      pointerPlane.XZ = new Vector3();
      pointerPlane.planes.push(pointerPlane.xzPlane);
    }
    pointerPlane.xzPlane.position.copy(world.position);

    this._intersections.length = 0;
    this.raycaster.setFromCamera(coords, this.presentation.camera);
    this.raycaster.intersectObjects(
      pointerPlane.planes,
      false,
      this._intersections
    );

    for (let i = 0; i < this._intersections.length; i++) {
      const isect = this._intersections[i];
      const orientation = isect.object.userData.orientation;
      pointerPlane[orientation].copy(isect.point).sub(world.position);
    }
  }

  createPlane(orientation: "XY" | "XZ") {
    const geometry = new PlaneBufferGeometry(1000, 1000, 1, 1);
    const material = new MeshBasicMaterial({
      alphaTest: 0,
      visible: false,
    });
    const plane = new Mesh(geometry, material);
    plane.userData.orientation = orientation;

    switch (orientation) {
      case "XY":
        break;
      case "XZ":
        plane.setRotationFromEuler(new Euler(-Math.PI / 2, 0, 0));
        break;
    }

    this.presentation.scene.add(plane);

    return plane;
  }
}
