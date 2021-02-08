import { System, Not, Groups } from "~/ecs/base";
import { WorldTransform, Transform } from "../components";
import { Matrix4 } from "three";
import { Queries } from "~/ecs/base/Query";

export class WorldTransformSystem extends System {
  frame: number;

  order = Groups.Simulation - 10;

  static queries: Queries = {
    new: [Transform, Not(WorldTransform)],
    active: [Transform, WorldTransform],
    removed: [Not(Transform), WorldTransform],
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
    const transform = entity.get(Transform);
    const world = entity.get(WorldTransform);
    const parent = entity.getParent();

    if (world.frame === this.frame) {
      return world;
    }

    if (!transform.matrix) transform.matrix = new Matrix4();
    if (!world.matrix) world.matrix = new Matrix4();

    transform.matrix.compose(
      transform.position,
      transform.rotation,
      transform.scale
    );

    if (parent) {
      const parentWorld = this.updateTransform(parent);
      world.matrix.multiplyMatrices(parentWorld.matrix, transform.matrix);
    } else {
      world.matrix.copy(transform.matrix);
    }

    world.matrix.decompose(world.position, world.rotation, world.scale);
    world.frame = this.frame;

    return world;
  }
}
