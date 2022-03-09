import { Vector2, Vector3, PerspectiveCamera, Group } from "three";

import { PlaneOrientation, WorldPlanes } from "~/ecs/shared/WorldPlanes";

import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { makeDragPlaneHelper } from "./DragPlaneHelper";

export class DragPlane {
  world: DecoratedECSWorld;
  orientation: PlaneOrientation = "XZ";
  planes: WorldPlanes = null;
  camera: PerspectiveCamera = new PerspectiveCamera();
  group: Group;

  constructor(world: DecoratedECSWorld) {
    this.world = world;
    this.planes = new WorldPlanes(
      this.world.presentation.camera,
      this.world.presentation.size,
      new Vector3()
    );
  }

  setOrientation(orientation: PlaneOrientation) {
    this.orientation = orientation;
  }

  setOrigin(origin: Vector3) {
    this.camera.copy(this.world.presentation.camera);
    this.planes.setOrigin(origin);
  }

  getDelta(screenCoord: Vector2) {
    const delta = new Vector3();

    this.planes.getWorldFromScreen(screenCoord, delta, {
      plane: this.orientation,
      camera: this.camera,
    });
    delta.sub(this.planes.origin);

    return delta;
  }

  show() {
    if (this.group) this.hide();

    this.group = makeDragPlaneHelper();

    this.group.position.copy(this.planes.origin);
    if (this.orientation == "XZ") {
      this.group.rotation.x += Math.PI / 2;
    }

    this.world.presentation.scene.add(this.group);
  }

  hide() {
    if (this.group) {
      this.group.removeFromParent();
      this.group = null;
    }
  }
}
