import type { Group, Mesh } from "three";

import { LocalComponent, RefType } from "~/ecs/base";

export class ColliderVisibleRef extends LocalComponent {
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
