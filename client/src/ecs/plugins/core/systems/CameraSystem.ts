import { PerspectiveCamera } from "three";
import { System, Not, Groups } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";
import { Object3DRef, Camera, CameraAttached } from "../components";
import { IS_BROWSER } from "../utils";

export class CameraSystem extends System {
  camera: PerspectiveCamera;

  active = IS_BROWSER;
  order = Groups.Initialization;

  static queries: Queries = {
    added: [Object3DRef, Camera, Not(CameraAttached)],
    removed: [Not(Camera), CameraAttached],
  };

  init({ presentation }) {
    this.camera = presentation?.camera;
  }

  update() {
    this.queries.added.forEach((entity) => {
      const object3d = entity.get(Object3DRef).value;
      object3d.add(this.camera);
      entity.add(CameraAttached);
    });
    this.queries.removed.forEach((entity) => {
      this.camera.parent.remove(this.camera);
      entity.remove(CameraAttached);
    });
  }
}
