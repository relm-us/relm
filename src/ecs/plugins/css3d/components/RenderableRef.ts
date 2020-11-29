import { StateComponent, RefType } from "hecs";

export class RenderableRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
