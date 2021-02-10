import { StateComponent, RefType } from "~/ecs/base";

export class Object3D extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
