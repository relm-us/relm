import { System, Groups, Not, Modified } from "hecs";
import { Outline } from "../components/Outline";
import { OutlineApplied } from "../components/OutlineApplied";
import { ModelMesh, ShapeMesh } from "hecs-plugin-three";

export class OutlineSystem extends System {
  order = Groups.Presentation;

  static queries = {
    added: [Outline, Not(OutlineApplied)],
    removed: [Not(Outline), OutlineApplied],
  };

  init({ effects }) {
    this.effects = effects;
  }

  update() {
    this.queries.added.forEach((entity) => {
      const mesh = entity.get(ModelMesh) || entity.get(ShapeMesh);
      if (mesh && this.effects.outlinePass) {
        this.effects.outlinePass.selectedObjects.push(mesh.value);
        entity.add(OutlineApplied);
      } else {
        console.warn(`Unable to add outline to entity ${entity.id}, no mesh`);
      }
    });
    this.queries.removed.forEach((entity) => {});
  }
}
