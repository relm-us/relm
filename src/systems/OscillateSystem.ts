import { System, Groups } from "hecs";
import { Vector3, Quaternion, Transform } from "hecs-plugin-core";

import {
  OscillatePosition,
  OscillateRotation,
  OscillateScale,
  OscillateBehavior,
} from "../components/Oscillate";

const position = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3();

export class OscillateSystem extends System {
  order = Groups.Initialization;

  static queries = {
    position: [Transform, OscillatePosition],
    rotation: [Transform, OscillateRotation],
    scale: [Transform, OscillateScale],
  };

  init() {
    this.oscillateAngle = 0;
  }

  update(timeDelta) {
    this.queries.position.forEach((entity) => {
      const spec = entity.get(OscillatePosition);
      const alpha = this.getAlpha(spec.behavior, spec.phase, spec.frequency);
      this.oscillatePosition(entity, alpha, spec.min, spec.max);
    });

    this.queries.rotation.forEach((entity) => {
      const spec = entity.get(OscillateRotation);
      const alpha = this.getAlpha(spec.behavior, spec.phase, spec.frequency);
      this.oscillateRotation(entity, alpha, spec.min, spec.max);
    });

    this.queries.scale.forEach((entity) => {
      const spec = entity.get(OscillateScale);
      const alpha = this.getAlpha(spec.behavior, spec.phase, spec.frequency);
      this.oscillateScale(entity, alpha, spec.min, spec.max);
    });

    // keep the whole system oscillating
    this.oscillateAngle += (Math.PI * 2) / (1000 / timeDelta);
  }

  getAlpha(behavior: OscillateBehavior, phase: number, frequency: number) {
    let alpha,
      angle = (phase + this.oscillateAngle) * frequency;

    // Various behaviors
    switch (behavior) {
      case "OSCILLATE":
        return (Math.cos(angle - Math.PI) + 1) / 2;
      case "BOUNCE":
        return Math.abs(Math.cos((angle - Math.PI) / 2));
      case "BOUNCE_PAUSE":
        alpha = Math.cos(angle - Math.PI);
        return alpha < 0 ? 0 : alpha;
      default:
        throw new Error(`Unknown oscillate behavior: ${behavior}`);
    }
  }

  oscillatePosition(entity, alpha, min, max) {
    const position = entity.get(Transform).position;
    position.copy(min).lerp(max, alpha);
  }

  oscillateRotation(entity, alpha, min, max) {
    const rotation = entity.get(Transform).rotation;
    rotation.copy(min).slerp(max, alpha);
  }

  oscillateScale(entity, alpha, min, max) {
    const scale = entity.get(Transform).scale;
    scale.copy(min).lerp(max, alpha);
  }
}
