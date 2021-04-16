import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import { Translucent, TranslucentApplied } from "../components";

export class TranslucentSystem extends System {
  order = Groups.Initialization;

  static queries = {
    new: [Object3D, Translucent, Not(TranslucentApplied)],
    modified: [Modified(Translucent)],
    removed: [Not(Translucent), TranslucentApplied],
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
    const translucent = entity.get(Translucent);

    object3d.value.traverse((node) => {
      if (node.isMesh) {
        node.userData.translucent = { opacity: node.material.opacity };
        node.material.transparent = true;
        node.material.opacity = translucent.opacity;
      }
    });

    entity.add(TranslucentApplied);
  }

  remove(entity: Entity) {
    const object3d = entity.get(Object3D);

    object3d.value.traverse((node) => {
      if (node.isMesh) {
        node.material.transparent = false;
        if (node.userData.translucent)
          node.material.opacity = node.userData.translucent.opacity;
        delete node.userData.translucent;
      }
    });

    entity.remove(TranslucentApplied);
  }
}
