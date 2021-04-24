import { DoubleSide, FrontSide } from "three";
import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import { Translucent, TranslucentApplied } from "../components";

export class TranslucentSystem extends System {
  order = Groups.Initialization + 1;

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
        node.userData.translucent = {
          opacity: node.material.opacity,
          side: node.material.side,
        };
        node.material.transparent = true;
        node.material.opacity = translucent.opacity;
        node.material.side = FrontSide;
      }
    });

    entity.add(TranslucentApplied);
  }

  remove(entity: Entity) {
    const object3d = entity.get(Object3D);

    object3d.value.traverse((node) => {
      if (node.isMesh) {
        const former = node.userData.translucent;
        if (former) {
          node.material.side = former.side;
          node.material.opacity = former.opacity;
        }
        node.material.transparent = false;
        delete node.userData.translucent;
      }
    });

    entity.remove(TranslucentApplied);
  }
}
