import { System, Groups, Not, Modified } from "hecs";
import { WorldTransform, Transform } from "hecs-plugin-core";

import { get } from "svelte/store";
import { mouse } from "~/world/mouse";

import { PointerPlane, PointerPlaneRef } from "../components";
import {
  Color,
  PlaneBufferGeometry,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  DoubleSide,
  Raycaster,
  Euler,
  LineDashedMaterial,
  BufferGeometry,
  Line,
} from "three";

type Orientation = "XY" | "XZ" | "YZ";

export class PointerPlaneSystem extends System {
  order = Groups.Initialization + 10;

  static queries = {
    added: [PointerPlane, Not(PointerPlaneRef)],
    modified: [Modified(PointerPlane), PointerPlaneRef],
    active: [PointerPlane, PointerPlaneRef, WorldTransform],
    removed: [Not(PointerPlane), PointerPlaneRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
    this.raycaster = new Raycaster();
    this._intersections = [];
  }

  update() {
    const coords = get(mouse);

    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.release(entity);
      this.build(entity);
    });
    this.queries.active.forEach((entity) => {
      this.updateIntersections(entity, coords);
    });
    this.queries.removed.forEach((entity) => {
      this.release(entity);
    });
  }

  build(entity) {
    const spec = entity.get(PointerPlane);

    const planes = ["XY", "XZ"].map((desc: Orientation) =>
      this.createPlane(desc, spec.visible)
    );

    entity.add(PointerPlaneRef, { planes });
  }

  updateIntersections(entity, coords) {
    const world = entity.get(WorldTransform);
    const ref = entity.get(PointerPlaneRef);

    ref.planes.forEach((plane) => {
      plane.position.copy(world.position);
    });

    this._intersections.length = 0;
    this.raycaster.setFromCamera(coords, this.presentation.camera);
    this.raycaster.intersectObjects(ref.planes, false, this._intersections);

    for (let i = 0; i < this._intersections.length; i++) {
      const isect = this._intersections[i];
      const orientation = isect.object.userData.orientation;
      ref[orientation].copy(isect.point).sub(world.position);
    }
  }

  release(entity) {
    const ref = entity.get(PointerPlaneRef);
    ref.planes.forEach((plane) => {
      plane.parent.remove(plane);
    });
    entity.remove(PointerPlaneRef);
  }

  getNormal(orientation: Orientation) {
    switch (orientation) {
      case "XY":
        return new Vector3(0, 0, 1);
      case "XZ":
        return new Vector3(0, 1, 0);
      case "YZ":
        return new Vector3(1, 0, 0);
    }
  }

  getColor(orientation: Orientation) {
    switch (orientation) {
      case "XY":
        return new Color(0xffff00);
      case "XZ":
        return new Color(0xff00ff);
      case "YZ":
        return new Color(0x00ffff);
    }
  }

  createPlane(orientation: Orientation, visible = false) {
    const size = 1000;
    const color = this.getColor(orientation);
    const geometry = new PlaneBufferGeometry(size, size, 1, 1);
    const material = new MeshBasicMaterial({
      color,
      visible,
      transparent: true,
      opacity: visible ? 0.15 : 0,
      side: DoubleSide,
    });

    const plane = new Mesh(geometry, material);
    plane.position.set(0.001, 0.001, 0.001);
    plane.userData.orientation = orientation;

    if (visible) {
      this.addPlaneHelper(plane, color);
      this.addCrosshairs(plane);
    }

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

  addPlaneHelper(parent, color) {
    const size = 1000;

    const points = [];
    const dashedLineMaterial = new LineDashedMaterial({
      color,
      dashSize: 0.3,
      gapSize: 0.1,
    });

    let x = -10;
    for (let i = 0; i < 6; i++) {
      points.length = 0;
      points.push(new Vector3(x, -0.01, -size / 2));
      points.push(new Vector3(x, -0.01, size / 2));
      const geometry = new BufferGeometry().setFromPoints(points);
      const line = new Line(geometry, dashedLineMaterial);
      line.computeLineDistances();

      parent.add(line);
      x += 4;
    }
  }

  addCrosshairs(parent) {
    const points = [];
    const solidLineMaterial = new LineBasicMaterial({
      color: "black",
    });
    solidLineMaterial.depthTest = false;
    // crosshairs
    for (let i = 0; i < 2; i++) {
      points.length = 0;
      if (i === 0) {
        points.push(new Vector3(0.01, -0.01, -2));
        points.push(new Vector3(0.01, -0.01, 2));
      } else {
        points.push(new Vector3(-2, -0.01, 0.01));
        points.push(new Vector3(2, -0.01, 0.01));
      }
      const geometry = new BufferGeometry().setFromPoints(points);
      const line = new Line(geometry, solidLineMaterial);

      parent.add(line);
    }
  }
}
