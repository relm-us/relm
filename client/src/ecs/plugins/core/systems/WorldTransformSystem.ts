import { System, Not, Groups } from "~/ecs/base";
import { WorldTransform, Object3D } from "../components";
import { Queries } from "~/ecs/base/Query";

export class WorldTransformSystem extends System {
  frame: number;

  order = Groups.Presentation + 200;

  static queries: Queries = {
    new: [Object3D, Not(WorldTransform)],
    active: [Object3D, WorldTransform],
    removed: [Not(Object3D), WorldTransform],
  };

  init() {
    this.frame = 0;
  }

  update() {
    this.frame++;
    this.queries.new.forEach((entity) => {
      entity.add(WorldTransform);
    });
    this.queries.active.forEach((entity) => {
      this.updateTransform(entity);
    });
    this.queries.removed.forEach((entity) => {
      entity.remove(WorldTransform);
    });
  }

  updateTransform(entity) {
    const object3d = entity.get(Object3D).value;
    const world = entity.get(WorldTransform);
    object3d.matrixWorld.decompose(world.position, world.rotation, world.scale);

    // if (world.frame === this.frame) {
    //   return world;
    // }
  }
}
