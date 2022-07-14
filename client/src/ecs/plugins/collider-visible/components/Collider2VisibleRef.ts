import type { Mesh } from "three";

import { LocalComponent, RefType } from "~/ecs/base";

export class Collider2VisibleRef extends LocalComponent {
  value: Mesh;

  static props = {
    value: {
      type: RefType,
    },
  };
}
