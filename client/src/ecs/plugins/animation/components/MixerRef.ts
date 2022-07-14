import { LocalComponent, RefType } from "~/ecs/base";

export class MixerRef extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
