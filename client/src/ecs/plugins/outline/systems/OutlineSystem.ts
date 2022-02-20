import { Object3D as ThreeObject3D } from "three";

import { System, Groups, Not, Entity } from "~/ecs/base";
import { Object3D, Presentation } from "~/ecs/plugins/core";
import { Outline, OutlineApplied } from "../components";

export class OutlineSystem extends System {
  presentation: Presentation;
  selectedObjects: ThreeObject3D[];

  order = Groups.Initialization + 50;

  static queries = {
    added: [Outline, Not(OutlineApplied), Object3D],
    removed: [Not(Outline), OutlineApplied],
  };

  init({ presentation }) {
    this.presentation = presentation;
    this.selectedObjects = [];
    this.presentation.outlineEffect.selection.set(this.selectedObjects);
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.addOutline(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.removeOutline(entity);
    });
  }

  addOutline(entity) {
    const object: ThreeObject3D = entity.get(Object3D).value;
    object.traverse((obj) => {
      this.presentation.outlineEffect.selection.add(obj);
    });
    entity.add(OutlineApplied, { object });
  }

  removeOutline(entity: Entity) {
    const applied = entity.get(OutlineApplied);
    if (applied) {
      applied.object.traverse((obj) => {
        this.presentation.outlineEffect.selection.delete(obj);
      });
      entity.remove(OutlineApplied);
    }
  }
}
