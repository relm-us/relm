import { System, Not, Modified, Groups } from "~/ecs/base";
import { Transform, WorldTransform, Object3D } from "../components";
import { Queries } from "~/ecs/base/Query";

export class WorldTransformSystem extends System {
  order = Groups.Presentation + 200;

  static queries: Queries = {
    new: [Object3D, Not(WorldTransform)],
    modified: [Object3D, WorldTransform, Modified(Transform)],
    removed: [Not(Object3D), WorldTransform],
  };

  update() {
    this.queries.new.forEach((entity) => {
      entity.add(WorldTransform);
      this.updateTransform(entity, true);
    });
    this.queries.modified.forEach((entity) => {
      this.updateTransform(entity);
    });
    this.queries.removed.forEach((entity) => {
      entity.remove(WorldTransform);
    });
  }

  updateTransform(entity, forceUpdate = false) {
    const object3d = entity.get(Object3D).value;
    const world = entity.get(WorldTransform);
    if (forceUpdate) object3d.updateMatrixWorld(true);
    object3d.matrixWorld.decompose(world.position, world.rotation, world.scale);
  }
}
