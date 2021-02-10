import { System, Groups, Not, Modified } from "~/ecs/base";
import { WorldTransform, Transform } from "~/ecs/plugins/core";

import { get } from "svelte/store";
import { mouse } from "~/stores/mouse";

import { PointerPlane, PointerPlaneRef } from "../components";
import {
  Color,
  PlaneBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  DoubleSide,
  Raycaster,
  Euler,
  GridHelper,
} from "three";
import { Presentation } from "~/ecs/plugins/core/Presentation";

type Orientation = "XY" | "XZ" | "YZ";

const _raycaster = new Raycaster();
const _intersections = [];
export class PointerPlaneSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization + 10;

  static queries = {
    added: [PointerPlane, Not(PointerPlaneRef)],
    modified: [Modified(PointerPlane), PointerPlaneRef],
    active: [PointerPlane, PointerPlaneRef, WorldTransform],
    removed: [Not(PointerPlane), PointerPlaneRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
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

    const planes = ["XY", "XZ"].map((orientation: Orientation) =>
      this.createPlane(orientation, spec.visible === orientation)
    );

    const component = entity.add(PointerPlaneRef, { planes });
  }

  updateIntersections(entity, coords) {
    const world = entity.get(WorldTransform);
    const ref = entity.get(PointerPlaneRef);

    ref.planes.forEach((plane) => {
      plane.position.copy(world.position);
    });

    _intersections.length = 0;
    _raycaster.setFromCamera(coords, this.presentation.camera);
    _raycaster.intersectObjects(ref.planes, false, _intersections);

    for (let i = 0; i < _intersections.length; i++) {
      const isect = _intersections[i];
      const orientation = isect.object.userData.orientation;
      if (orientation === "XZ") {
        ref.XZ.x = isect.point.x - world.position.x;
        ref.XZ.z = isect.point.z - world.position.z;
      } else if (orientation === "XY") {
        ref.XY.x = isect.point.x - world.position.x;
        ref.XY.y = isect.point.y - world.position.y;
      }
    }

    ref.updateCount++;
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

  createPlane(orientation: Orientation, visible = false) {
    const size = 1000;
    const geometry = new PlaneBufferGeometry(size, size, 1, 1);
    const material = new MeshBasicMaterial({
      color: 0xffff00,
      visible,
      transparent: true,
      opacity: visible ? 0.15 : 0,
      side: DoubleSide,
    });

    const plane = new Mesh(geometry, material);
    // plane.position.set(0.001, 0.001, 0.001);
    plane.userData.orientation = orientation;

    switch (orientation) {
      case "XY":
        break;
      case "XZ":
        plane.setRotationFromEuler(new Euler(-Math.PI / 2, 0, 0));
        break;
    }

    if (visible) {
      const gridHelper = new GridHelper(100, 100, 0xffffff, 0x888888);
      gridHelper.setRotationFromEuler(new Euler(-Math.PI / 2, 0, 0));
      plane.add(gridHelper);
    }

    this.presentation.scene.add(plane);

    return plane;
  }
}
