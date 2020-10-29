import { System, Groups } from "hecs";
import { Transform, Vector3 } from "hecs-plugin-core";
import SimplexNoise from "simplex-noise";

import { Noise } from "../components/Noise";
import { CompositeTransform } from "../components/CompositeTransform";

const simplex = new SimplexNoise();

const position = new Vector3();

function randomVector3(min, max) {
  const range = max - min;
  return new Vector3(
    Math.random() * range + min,
    Math.random() * range + min,
    Math.random() * range + min
  );
}

export class NoiseSystem extends System {
  order = Groups.Initialization;

  static queries = {
    shaking: [CompositeTransform, Noise],
  };

  update(delta) {
    this.queries.shaking.forEach((entity) => {
      const spec = entity.get(Noise);
      if (!spec.noisePos) {
        spec.noisePos = randomVector3(0, 100);
        spec.noiseDir = randomVector3(0, 100)
          .normalize()
          .multiplyScalar(spec.speed / 100);
      }
      this.shake(entity, spec.magnitude, spec.noisePos, spec.noiseDir);
    });
  }

  shake(entity, magnitude, noisePos, noiseDir) {
    noisePos.add(noiseDir);

    const noiseX = simplex.noise3D(
      noisePos.x + 0,
      noisePos.y + 0,
      noisePos.z + 0
    );
    const noiseY = simplex.noise3D(
      noisePos.x + 71,
      noisePos.y + 17,
      noisePos.z + 37
    );
    const noiseZ = simplex.noise3D(
      noisePos.x + 19,
      noisePos.y + 23,
      noisePos.z + 11
    );

    position.x = (noiseX / 10) * magnitude.x;
    position.y = (noiseY / 10) * magnitude.y;
    position.z = (noiseZ / 10) * magnitude.z;

    entity.get(CompositeTransform).set("noise", "position", position);
  }
}
