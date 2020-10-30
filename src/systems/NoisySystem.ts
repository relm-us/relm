import { System, Groups } from "hecs";
import SimplexNoise from "simplex-noise";
import { Transform } from "hecs-plugin-core";

import { Noisy, NoisyProperty } from "../components/Noisy";
import { Vector3 } from "three";

const simplex = new SimplexNoise();

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
    all: [Transform, Noisy],
  };

  update(timeDelta) {
    this.queries.all.forEach((entity) => {
      const spec = entity.get(Noisy);
      if (!spec.noisePos) {
        spec.noisePos = randomVector3(0, 100);
        spec.noiseDir = randomVector3(0, 100)
          .normalize()
          .multiplyScalar(spec.speed / 100);
      }
      this.addNoise(
        entity,
        spec.property,
        spec.magnitude,
        spec.noisePos,
        spec.noiseDir
      );
    });
  }

  addNoise(
    entity,
    property: NoisyProperty,
    magnitude: Vector3,
    noisePos: Vector3,
    noiseDir: Vector3
  ) {
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

    const position = entity.get(Transform).position;

    position.x = (noiseX / 10) * magnitude.x;
    position.y = (noiseY / 10) * magnitude.y;
    position.z = (noiseZ / 10) * magnitude.z;
  }
}
