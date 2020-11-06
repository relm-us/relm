import { System, Groups, Not } from "hecs";
import { Transform } from "hecs-plugin-core";
import { ModelMesh } from "hecs-plugin-three";
import { CenterMesh } from "../components/CenterMesh";
import { CenteredMesh } from "../components/CenteredMesh";

export class CenteredMeshSystem extends System {
  order = Groups.Simulation;

  static queries = {
    new: [ModelMesh, CenterMesh, Not(CenteredMesh)],
  };

  update() {
    this.queries.new.forEach((entity) => {
      const mesh = entity.get(ModelMesh).value;
      if (mesh.children.length === 1) {
        mesh.children[0].position.set(0, 0, 0);
        mesh.children[0].castShadow = true;
      } else {
        // TODO: average the positions, or find center of bbox
      }
      entity.add(CenteredMesh);
    });
  }
}
