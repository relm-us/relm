import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import { Interactive, InteractiveApplied } from "../components";

export class InteractiveSystem extends System {
  order = Groups.Initialization;

  static queries = {
    new: [Object3D, Interactive, Not(InteractiveApplied)],
    modified: [Modified(Interactive)],
    removed: [Not(Interactive), InteractiveApplied],
  };

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const object3d = entity.get(Object3D);
    const interact = entity.get(Interactive);
    object3d.value.userData.invisibleToMouse = interact.mouse;
    entity.add(InteractiveApplied);
  }

  remove(entity: Entity) {
    const object3d = entity.get(Object3D);
    if (object3d) delete object3d.value.userData.invisibleToMouse;
    entity.remove(InteractiveApplied);
  }
}
