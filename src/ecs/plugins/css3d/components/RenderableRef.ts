import { LocalComponent, RefType } from "hecs";

export class RenderableRef extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
