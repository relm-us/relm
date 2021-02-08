import { StateComponent, RefType } from "~/ecs/base";

export class RenderableRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
