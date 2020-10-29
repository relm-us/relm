import { System, Groups } from "hecs";
import { Transform, Vector3 } from "hecs-plugin-core";
import SimplexNoise from "simplex-noise";

import { Shake } from "../components/Shake";
import { CompositeTransform } from "../components/CompositeTransform";

const simplex = new SimplexNoise();

const position = new Vector3();

export class ShakeSystem extends System {
  order = Groups.Initialization;

  static queries = {
    shaking: [CompositeTransform, Shake],
  };

  update(delta) {
    this.queries.shaking.forEach((entity) => {
      const spec = entity.get(Shake);
      if (!spec.travel) {
        spec.travel = new Vector3(
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100
        );
      }
      this.shake(entity, spec.speed, spec.travel, spec.magnitude);
    });
  }

  shake(entity, speed, travel, magnitude) {
    travel.x += 0.051 * speed;
    travel.y += 0.047 * speed;

    const noiseX = simplex.noise2D(travel.x, travel.y);
    const noiseY = simplex.noise2D(travel.x + 71, travel.y + 17);
    const noiseZ = simplex.noise2D(travel.x + 19, travel.y + 23);

    position.x = (noiseX / 10) * magnitude.x;
    position.y = (noiseY / 10) * magnitude.y;
    position.z = (noiseZ / 10) * magnitude.z;

    entity.get(CompositeTransform).setCompositePosition("shake", position);
  }
}
