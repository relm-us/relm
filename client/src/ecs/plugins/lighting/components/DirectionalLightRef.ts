import { StateComponent, RefType } from "~/ecs/base";

export class DirectionalLightRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
