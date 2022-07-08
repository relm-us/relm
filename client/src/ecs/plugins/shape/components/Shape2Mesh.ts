import { StateComponent, RefType } from "~/ecs/base";

export class Shape2Mesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
