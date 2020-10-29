import { System, Groups } from "hecs";
import { Transform, Vector3 } from "hecs-plugin-core";

import { CompositeTransform } from "../components/CompositeTransform";
import { Oscillate } from "../components/Oscillate";

const bounce = true;
const position = new Vector3();

export class OscillateSystem extends System {
  order = Groups.Initialization;

  static queries = {
    all: [CompositeTransform, Oscillate],
  };

  init() {
    this.oscillateAngle = 0;
  }

  update(timeDelta) {
    this.queries.all.forEach((entity) => {
      const spec = entity.get(Oscillate);
      this.oscillate(
        entity,
        spec.behavior,
        spec.phase,
        spec.speed,
        spec.direction
      );
    });

    this.oscillateAngle += (Math.PI * 2) / (1000 / timeDelta);
  }

  oscillate(entity, behavior, phase, speed, direction) {
    let angle = (phase + this.oscillateAngle) * speed;
    let delta = Math.cos(angle);

    // Various behaviors
    switch (behavior) {
      case "OSCILLATE":
        break;
      case "BOUNCE":
        if (delta < 0) delta /= 4;
        break;
      case "HARD_BOUNCE":
        delta = Math.abs(delta);
        break;
      default:
        throw new Error(`Unknown oscillate behavior: ${behavior}`);
    }

    position.x = delta * direction.x;
    position.y = delta * direction.y;
    position.z = delta * direction.z;

    entity.get(CompositeTransform).setCompositePosition("oscillate", position);
  }
}
