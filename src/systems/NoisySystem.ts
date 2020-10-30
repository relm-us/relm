import { System, Groups } from "hecs";
import SimplexNoise from "simplex-noise";

import { NoisyPosition, NoisyRotation, NoisyScale } from "../components/Noisy";
import { CompositeTransform } from "../components/CompositeTransform";
import { Vector3 } from "three";

const simplex = new SimplexNoise();

const position = new Vector3();
const scale = new Vector3();

function randomVector3(min: number, max: number): Vector3 {
  const range = max - min;
  return new Vector3(
    Math.random() * range + min,
    Math.random() * range + min,
    Math.random() * range + min
  );
}

export class NoisySystem extends System {
  order = Groups.Initialization;

  static queries = {
    position: [CompositeTransform, NoisyPosition],
    rotation: [CompositeTransform, NoisyRotation],
    scale: [CompositeTransform, NoisyScale],
  };

  update() {
    this.queries.position.forEach((entity) => {
      const spec = entity.get(NoisyPosition);
      if (!spec.noisePos) this.initNoise(spec);
      this.generateNextNoise(spec.noise, spec.noisePos, spec.noiseDir);
      this.addNoiseToPosition(entity, spec.noise, spec.magnitude);
    });
    this.queries.scale.forEach((entity) => {
      const spec = entity.get(NoisyScale);
      if (!spec.noisePos) this.initNoise(spec);
      this.generateNextNoise(spec.noise, spec.noisePos, spec.noiseDir);
      this.addNoiseToScale(entity, spec.noise, spec.magnitude, spec.dependent);
    });
  }

  initNoise(component) {
    if (!component.noise) {
      component.noise = new Vector3();
      component.noisePos = randomVector3(0, 100);
      component.noiseDir = randomVector3(0, 100)
        .normalize()
        .multiplyScalar(component.speed / 100);
    }
  }

  generateNextNoise(noise: Vector3, pos: Vector3, direction: Vector3) {
    pos.add(direction);

    noise.x = simplex.noise3D(pos.x + 0, pos.y + 0, pos.z + 0);
    noise.y = simplex.noise3D(pos.x + 71, pos.y + 17, pos.z + 37);
    noise.z = simplex.noise3D(pos.x + 19, pos.y + 23, pos.z + 11);
  }

  addNoiseToPosition(entity, noise: Vector3, magnitude: Vector3) {
    position.x = (noise.x / 10) * magnitude.x;
    position.y = (noise.y / 10) * magnitude.y;
    position.z = (noise.z / 10) * magnitude.z;

    entity.get(CompositeTransform).offset("noisy", "position", position);
  }

  addNoiseToScale(
    entity,
    noise: Vector3,
    magnitude: Vector3,
    dependent: Boolean
  ) {
    if (dependent) {
      // console.log("dep noise", noise);
      scale.x = 1 + (noise.x / 10) * magnitude.x;
      scale.y = 1 + (noise.x / 10) * magnitude.y;
      scale.z = 1 + (noise.x / 10) * magnitude.z;
    } else {
      scale.x = 1 + (noise.x / 10) * magnitude.x;
      scale.y = 1 + (noise.y / 10) * magnitude.y;
      scale.z = 1 + (noise.z / 10) * magnitude.z;
    }

    entity.get(CompositeTransform).offset("noisy", "scale", scale);
  }
}
