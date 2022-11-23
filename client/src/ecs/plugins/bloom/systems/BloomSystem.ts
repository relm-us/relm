import { Object3D } from "three";

import { System, Groups, Modified, Not, Entity } from "~/ecs/base";
import { Object3DRef, Presentation } from "~/ecs/plugins/core";
import { Bloom2, Bloom2Active, BloomApplied } from "../components";

export class BloomSystem extends System {
  presentation: Presentation;
  selectedObjects: Object3D[];

  order = Groups.Initialization + 50;

  static queries = {
    added: [Bloom2, Bloom2Active, Not(BloomApplied), Object3DRef],
    modified: [BloomApplied, Modified(Object3DRef)],
    removed: [Not(Bloom2), BloomApplied],
    deactivated: [BloomApplied, Not(Bloom2Active)],
  };

  init({ presentation }) {
    this.presentation = presentation;
    this.selectedObjects = [];
    this.presentation.bloomEffect.selection.set(this.selectedObjects);
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.addEffect(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.removeEffect(entity);
      this.addEffect(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.removeEffect(entity);
    });

    this.queries.deactivated.forEach((entity) => {
      this.removeEffect(entity);
    });
  }

  addEffect(entity) {
    const object: Object3D = entity.get(Object3DRef).value;
    object.traverse((obj) => {
      this.presentation.bloomEffect.selection.add(obj);
    });
    entity.add(BloomApplied, { object });
  }

  removeEffect(entity: Entity) {
    const applied = entity.get(BloomApplied);
    if (applied) {
      applied.object.traverse((obj) => {
        this.presentation.bloomEffect.selection.delete(obj);
      });
      entity.remove(BloomApplied);
    }
  }
}
