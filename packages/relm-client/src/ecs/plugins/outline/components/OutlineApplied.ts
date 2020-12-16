import { StateComponent, RefType } from "hecs";

export class OutlineApplied extends StateComponent {
  static props = {
    object: {
      type: RefType,
    },
  };
}
