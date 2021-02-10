import { System, Groups } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
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
