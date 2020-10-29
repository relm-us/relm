import { System, Groups, Not } from "hecs";
import { Transform } from "hecs-plugin-core";
import { ModelMesh } from "hecs-plugin-three";
import { CenteredLoadedMesh } from "../components/CenteredLoadedMesh";

export class CenteredLoadedMeshSystem extends System {
  order = Groups.Simulation;

  static queries = {
    new: [ModelMesh, Not(CenteredLoadedMesh)],
  };

  update(delta) {
    this.queries.new.forEach((entity) => {
      const mesh = entity.get(ModelMesh).value;
      if (mesh.children.length === 1) {
        mesh.children[0].position.set(0, 0, 0);
      }
      console.log("Mesh loaded", mesh);
      entity.add(CenteredLoadedMesh);
    });
  }
}
