import { worldManager } from "~/world";

import { Entity, System } from "~/ecs/base";

import { Item2, Taken } from "../components";

export class ItemSystem extends System {
  static queries = {
    taken: [Item2, Taken],
  };

  update() {
    this.queries.taken.forEach((entity) => {
      this.take(entity);
    });
  }

  take(entity: Entity) {
    try {
      worldManager.inventory.take(entity.id);
    } catch (err) {
      alert(err);
    }

    entity.remove(Taken);
  }
}
