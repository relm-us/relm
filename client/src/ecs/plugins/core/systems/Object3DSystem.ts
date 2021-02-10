import * as THREE from "three";
import { System, Not, Groups } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";
import { Object3D, Transform } from "../components";
import { Presentation } from "../Presentation";

export class Object3DSystem extends System {
  presentation: Presentation;

  order = Groups.Presentation - 10;

  static queries: Queries = {
    new: [Transform, Not(Object3D)],
    removed: [Not(Transform), Object3D],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  reset() {
    this.presentation.object3ds.length = 0;
  }

  update() {
    this.queries.new.forEach((entity) => {
      const object3d = new THREE.Object3D();
      object3d.name = entity.name;
      object3d.userData.entityId = entity.id;
      const parentObject3D = entity.parent
        ? entity.getParent().get(Object3D).value
        : this.presentation.scene;
      parentObject3D.add(object3d);
      this.presentation.object3ds.push(object3d);
      entity.add(Object3D, { value: object3d });

      // First, copy Transform values into Object3D
      const transform = entity.get(Transform);
      object3d.position.copy(transform.position);
      object3d.quaternion.copy(transform.rotation);
      object3d.scale.copy(transform.scale);

      // Finally, use Object3D values as Transform values
      // (This saves CPU & Memory)
      transform.position = object3d.position;
      transform.rotation = object3d.quaternion;
      transform.scale = object3d.scale;
    });

    this.queries.removed.forEach((entity) => {
      const object3d = entity.get(Object3D).value;
      object3d.parent.remove(object3d);
      const idx = this.presentation.object3ds.indexOf(object3d);
      if (idx !== -1) {
        this.presentation.object3ds.splice(idx, 1);
      }
      entity.remove(Object3D);
    });
  }
}
