import { StateComponent, RefType } from "~/ecs/base";

export class Html2dRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },

    component: {
      type: RefType,
    },
  };
}
