import { StateComponent, RefType } from "~/ecs/base";

export class ColorApplied extends StateComponent {
  static props = {
    original: {
      type: RefType,
    },
  };
}
