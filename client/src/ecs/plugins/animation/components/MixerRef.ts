import { StateComponent, RefType } from "~/ecs/base";

export class MixerRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
