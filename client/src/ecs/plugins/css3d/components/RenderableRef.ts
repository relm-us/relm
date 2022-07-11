import { LocalComponent, RefType } from "~/ecs/base";

export class RenderableRef extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
