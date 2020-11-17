import { System, Groups } from "hecs";
import { Impact } from "~/ecs/plugins/rapier/components";
import { ThrustController, PotentiallyControllable } from "../components";

type Entity = any;
type Component = any;

export class TransferControlSystem extends System {
  order = Groups.Simulation;

  static queries = {
    default: [Impact, ThrustController],
  };

  update() {
    this.queries.default.forEach((entity) => {
      const impact = entity.get(Impact);

      for (const [entityId, impactMagnitude] of Object.entries(impact.others)) {
        const otherEntity = this.world.entities.getById(entityId);
        if (otherEntity.has(PotentiallyControllable) && impactMagnitude > 1) {
          this.transferComponents(entity, otherEntity, [ThrustController]);
          break;
        }
      }
    });
  }

  transferComponents(
    fromEntity: Entity,
    toEntity: Entity,
    Components: Array<any>
  ) {
    for (const Component of Components) {
      const fromComponent = fromEntity.get(Component);
      const toComponent = toEntity.add(Component, {}, true);

      toComponent.fromJSON(fromComponent.toJSON());

      fromEntity.remove(Component);
    }
  }
}
