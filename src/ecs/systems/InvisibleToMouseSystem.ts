import { System, Groups } from "hecs";
import { Object3D } from "hecs-plugin-three";
import { InvisibleToMouse } from "../components/InvisibleToMouse";

export class InvisibleToMouseSystem extends System {
  order = Groups.Initialization;

  static queries = {
    added: [InvisibleToMouse],
  };

  update() {
    this.queries.added.forEach((entity) => {
      const object3d = entity.get(Object3D);

      if (object3d) {
        object3d.value.userData.invisibleToMouse = true;
        // TODO: use a proper ECS pattern here rather than one-shotting it
        entity.remove(InvisibleToMouse);
      }
    });
  }
}
