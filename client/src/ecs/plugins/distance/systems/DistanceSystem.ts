import { System, Groups, Not } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { Distance, DistanceRef } from "../components";

export class DistanceSystem extends System {
  order = Groups.Simulation + 1;

  static queries = {
    added: [Distance, Not(DistanceRef)],
    active: [Distance, DistanceRef, Transform],
    removed: [Not(Distance), DistanceRef],
  };

  update() {
    this.queries.added.forEach((entity) => {
      entity.add(DistanceRef);
    });
    this.queries.active.forEach((entity) => {
      const otherEntityId = entity.get(Distance).target;
      const otherEntity = this.world.entities.getById(otherEntityId);
      const otherPos = otherEntity?.get(Transform)?.position;
      if (otherPos) {
        const pos = entity.get(Transform).position;
        const ref = entity.get(DistanceRef);
        ref.value = pos.distanceTo(otherPos);
      }
    });
    this.queries.removed.forEach((entity) => {
      entity.remove(DistanceRef);
    });
  }
}
