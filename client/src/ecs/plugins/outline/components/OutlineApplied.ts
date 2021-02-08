import { StateComponent, RefType } from "~/ecs/base";

export class OutlineApplied extends StateComponent {
  static props = {
    object: {
      type: RefType,
    },
  };
}
