import { Object3D as ThreeObject3D } from "three";
import { WireframeGeometry2 } from "three/examples/jsm/lines/WireframeGeometry2";
import { Wireframe } from "three/examples/jsm/lines/Wireframe";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Mesh, Group, DoubleSide, MeshLambertMaterial } from "three";
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
    const object = entity.get(Object3D).value.children[0];
    // object.layers.toggle(10);
    // this.selectedObjects.push(object);
    // this.presentation.outlinePass.selectedObjects = this.selectedObjects;
    this.presentation.outlineEffect.selection.add(object);
    entity.add(OutlineApplied, { object });
  }

  removeOutline(entity: Entity) {
    const applied = entity.get(OutlineApplied);
    if (applied) {
      // applied.object.layers.toggle(10);
      // const idx = this.selectedObjects.indexOf(applied.object);
      // if (idx >= 0) this.selectedObjects.splice(idx, 1);
      this.presentation.outlineEffect.selection.delete(applied.object);
      entity.remove(OutlineApplied);
    }
  }
}
