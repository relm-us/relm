import { System, Groups } from "hecs";
import { Impact } from "~/ecs/plugins/rapier/components";
import { PotentiallyControllable } from "../components/PotentiallyControllable";
import { ThrustController } from "../components/ThrustController";

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
          entity.remove(ThrustController);
          otherEntity.add(ThrustController);
          break;
        }
      }
    });
  }
}
