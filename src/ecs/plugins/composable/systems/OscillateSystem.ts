import { System, Groups } from "hecs";
import { Vector3, Quaternion } from "hecs-plugin-core";

import { ComposableTransform } from "../components/ComposableTransform";
import {
  OscillatePosition,
  OscillateRotation,
  OscillateScale,
} from "../components/Oscillate";

const position = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3();

export class OscillateSystem extends System {
  order = Groups.Initialization;

  static queries = {
    position: [ComposableTransform, OscillatePosition],
    rotation: [ComposableTransform, OscillateRotation],
    scale: [ComposableTransform, OscillateScale],
  };

  init() {
    this.cycleAngle = 0;
    this.cycleTick = 0;
  }

  update(timeDelta) {
    // Increment the cycle angle
    const angleIncrease = (Math.PI * 2) / (1000 / timeDelta);

    this.queries.position.forEach((entity) => {
      const spec = entity.get(OscillatePosition);
      if (spec.angle === undefined) {
        spec.angle = spec.phase / spec.frequency;
      }
      const alpha = this.getAlpha(spec.behavior, spec.angle, spec.frequency);
      if (this.isCycleCountComplete(spec, angleIncrease)) {
        entity.get(ComposableTransform).offsetPosition("oscillate", null);
        entity.remove(OscillatePosition);
      } else {
        this.oscillatePosition(entity, alpha, spec.min, spec.max);
        spec.angle += angleIncrease;
      }
    });

    this.queries.rotation.forEach((entity) => {
      const spec = entity.get(OscillateRotation);
      if (spec.angle === undefined) {
        spec.angle = spec.phase / spec.frequency;
      }
      const alpha = this.getAlpha(spec.behavior, spec.angle, spec.frequency);
      if (this.isCycleCountComplete(spec, angleIncrease)) {
        entity.get(ComposableTransform).offsetRotation("oscillate", null);
        entity.remove(OscillateRotation);
      } else {
        this.oscillateRotation(entity, alpha, spec.min, spec.max);
        spec.angle += angleIncrease;
      }
    });

    this.queries.scale.forEach((entity) => {
      const spec = entity.get(OscillateScale);
      if (spec.angle === undefined) {
        spec.angle = spec.phase / spec.frequency;
      }
      const alpha = this.getAlpha(spec.behavior, spec.angle, spec.frequency);
      if (this.isCycleCountComplete(spec, angleIncrease)) {
        entity.get(ComposableTransform).offsetScale("oscillate", null);
        entity.remove(OscillateScale);
      } else {
        this.oscillateScale(entity, alpha, spec.min, spec.max);
        spec.angle += angleIncrease;
      }
    });
  }

  // Return a value from 0 to 1 that can be used to lerp
  getAlpha(
    behavior: "OSCILLATE" | "BOUNCE" | "BOUNCE_PAUSE",
    angle: number,
    frequency: number
  ) {
    const theta = angle * frequency - Math.PI;

    // Various behaviors
    switch (behavior) {
      case "OSCILLATE":
        return (Math.cos(theta) + 1) / 2;
      case "BOUNCE":
        return Math.abs(Math.cos(theta / 2));
      case "BOUNCE_PAUSE":
        const alpha = Math.cos(theta);
        return alpha < 0 ? 0 : alpha;
      default:
        throw new Error(`Unknown oscillate behavior: ${behavior}`);
    }
  }

  oscillatePosition(entity, alpha, min, max) {
    position.copy(min).lerp(max, alpha);
    entity.get(ComposableTransform).offsetPosition("oscillate", position);
  }

  oscillateRotation(entity, alpha, min, max) {
    rotation.copy(min).slerp(max, alpha);
    entity.get(ComposableTransform).offsetRotation("oscillate", rotation);
  }

  oscillateScale(entity, alpha, min, max) {
    scale.copy(min).lerp(max, alpha);
    entity.get(ComposableTransform).offsetScale("oscillate", scale);
  }

  isCycleCountComplete(component, angle: number) {
    if (component.cycles >= 0) {
      if (!component.cycleAngle) {
        component.cycleAngle = 0;
      }
      component.cycleAngle += angle;

      return (
        component.cycleAngle * component.frequency >=
        component.cycles * Math.PI * 2
      );
    } else {
      return false;
    }
  }
}
