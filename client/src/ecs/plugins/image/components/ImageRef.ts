import { StateComponent, RefType } from "~/ecs/base";

export class ImageRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
