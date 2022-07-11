import { LocalComponent, RefType } from "~/ecs/base";

export class ImageRef extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
