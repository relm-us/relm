import { System, Groups, Not, Modified } from "hecs";
import {
  Mesh,
  MeshLambertMaterial,
  FrontSide,
  BackSide,
  Group,
  BoxBufferGeometry,
} from "three";
import { Outline } from "../components/Outline";
import { OutlineApplied } from "../components/OutlineApplied";
import { Transform } from "hecs-plugin-three";
import { ModelMesh, ShapeMesh, Object3D } from "hecs-plugin-three";

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
      const object3d = entity.get(Object3D);
      if (mesh && object3d) {
        const geometry = mesh.value;

        // Group to contain both the object & its outline
        const group = new Group();

        // Remove the geometry, then add the geometry back, but now as a child of the Group
        object3d.value.remove(geometry);
        group.add(geometry);

        // Create the outline
        // const outline = new Mesh(geometry,
        const outline = new Mesh(
          new BoxBufferGeometry(1, 1, 1),
          new MeshLambertMaterial({
            color: "black",
            side: BackSide,
          })
        );
        outline.scale.set(1.05, 1.05, 1.05);
        group.add(outline);

        object3d.value.add(group);

        entity.add(OutlineApplied);
        console.log(`Added outline to entity`, entity.id);
      } else {
        console.warn(`Can't add outline to entity`, entity.id);
      }
    });
    this.queries.removed.forEach((entity) => {});
  }
}
