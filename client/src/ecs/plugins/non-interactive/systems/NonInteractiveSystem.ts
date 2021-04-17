import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import { NonInteractive, NonInteractiveApplied } from "../components";

export class NonInteractiveSystem extends System {
  order = Groups.Initialization;

  static queries = {
    new: [Object3D, NonInteractive, Not(NonInteractiveApplied)],
    modified: [Modified(NonInteractive)],
    removed: [Not(NonInteractive), NonInteractiveApplied],
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
    object3d.value.userData.nonInteractive = true
    entity.add(NonInteractiveApplied);
  }

  remove(entity: Entity) {
    const object3d = entity.get(Object3D);
    if (object3d) delete object3d.value.userData.nonInteractive;
    entity.remove(NonInteractiveApplied);
  }
}
