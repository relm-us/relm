import { LocalComponent, RefType } from "~/ecs/base";

export class WallMesh extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
