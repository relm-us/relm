import { Vector3 } from "three";

import { Transform } from "~/ecs/plugins/core";
import { Particles } from "~/ecs/plugins/particles";

export function makeSparkles(world, position) {
  return world.entities
    .create("Portal Sparkle")
    .add(Transform, {
      position: new Vector3().copy(position).add(new Vector3(0, 1.5, 0)),
    })
    .add(Particles, { prefab: "TELEPORT" })
    .activate();
}
