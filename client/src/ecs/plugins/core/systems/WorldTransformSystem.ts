import { System, Modified, Groups } from "~/ecs/base";
import { Transform, Object3D } from "../components";
import { Queries } from "~/ecs/base/Query";

export class WorldTransformSystem extends System {
  order = Groups.Presentation + 200;

  static queries: Queries = {
    modified: [Modified(Transform), Object3D],
  };

  update() {
    this.queries.modified.forEach((entity) => {
      this.updateTransform(entity);
    });
  }

  updateTransform(entity) {
    const transform = entity.get(Transform);
    const object3d = entity.get(Object3D).value;

    object3d.matrix.compose(
      transform.position,
      transform.rotation,
      transform.scale
    );
    
    object3d.matrixWorldNeedsUpdate = true;
  }
}
