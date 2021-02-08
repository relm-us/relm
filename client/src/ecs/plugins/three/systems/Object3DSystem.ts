import * as THREE from "three";
import { System, Not, Groups } from "~/ecs/base";
import { WorldTransform } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";
import { Object3D } from "../components";
import { Presentation } from "../Presentation";

export class Object3DSystem extends System {
  presentation: Presentation;

  order = Groups.Presentation - 10;

  static queries: Queries = {
    new: [WorldTransform, Not(Object3D)],
    active: [WorldTransform, Object3D],
    removed: [Not(WorldTransform), Object3D],
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
      this.presentation.scene.add(object3d);
      this.presentation.object3ds.push(object3d);
      entity.add(Object3D, { value: object3d });
    });
    this.queries.active.forEach((entity) => {
      const object3d = entity.get(Object3D).value;
      const world = entity.get(WorldTransform);
      object3d.position.copy(world.position);
      object3d.quaternion.copy(world.rotation);
      object3d.scale.copy(world.scale);
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
