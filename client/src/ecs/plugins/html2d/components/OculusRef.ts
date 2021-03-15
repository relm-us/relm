import { StateComponent, RefType } from "~/ecs/base";

export class OculusRef extends StateComponent {
  static props = {
    container: {
      type: RefType,
    },

    component: {
      type: RefType,
    },
  };
}
