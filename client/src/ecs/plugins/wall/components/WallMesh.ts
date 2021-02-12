import { StateComponent, RefType } from "~/ecs/base";

export class WallMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
