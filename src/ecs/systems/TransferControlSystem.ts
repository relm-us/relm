import { System, Groups } from "hecs";
import { Quaternion, Euler } from "three";
import { Impact } from "~/ecs/plugins/rapier/components";
import {
  OscillatePosition,
  OscillateRotation,
  OscillateScale,
} from "~/ecs/plugins/composable";
import { PotentiallyControllable } from "../components/PotentiallyControllable";
import { ThrustController } from "../components/ThrustController";

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
          this.transferComponents(entity, otherEntity, [
            ThrustController,
            OscillatePosition,
            OscillateScale,
          ]);
          otherEntity.add(OscillateRotation, {
            cycles: 1.5,
            phase: Math.PI / 2,
            frequency: 4,
            min: new Quaternion().setFromEuler(new Euler(0, -Math.PI / 8, 0)),
            max: new Quaternion().setFromEuler(new Euler(0, Math.PI / 8, 0)),
          });
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
