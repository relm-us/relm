import { Vector3, Matrix4, Quaternion, Euler } from "three";
import { System, Entity, Groups } from "~/ecs/base";

import { Transform, Presentation } from "~/ecs/plugins/core";
import { Spin } from "../components";

const e1 = new Euler();
const r1 = new Quaternion();

export class SpinSystem extends System {
  order = Groups.Initialization;

  static queries = {
    active: [Spin],
  };

  update(delta) {
    const time = performance.now() / 1000;
    this.queries.active.forEach((entity) => {
      this.spinning(entity, time);
    });
  }

  spinning(entity: Entity, time: number) {
    const spin: Spin = entity.get(Spin);
    const transform = entity.get(Transform);

    const radian = spin.speed * Math.PI * 2 * time;

    switch (spin.axis) {
      case "X":
        e1.set(radian, 0, 0);
        break;
      case "Y":
        e1.set(0, radian, 0);
        break;
      case "Z":
        e1.set(0, 0, radian);
        break;
    }

    transform.rotation.setFromEuler(e1);
    transform.modified();
  }
}
