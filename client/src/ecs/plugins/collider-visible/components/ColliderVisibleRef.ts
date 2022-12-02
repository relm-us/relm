import type { Group, Mesh } from "three";

import { StateComponent, RefType } from "~/ecs/base";

export class ColliderVisibleRef extends StateComponent {
  value: Mesh;
  group: Group;

  static props = {
    value: {
      type: RefType,
    },

    group: {
      type: RefType,
    },
  };
}
