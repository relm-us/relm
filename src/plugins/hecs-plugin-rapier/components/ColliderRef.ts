import { StateComponent, RefType } from "hecs";

export class ColliderRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
