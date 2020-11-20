import { StateComponent, RefType } from "hecs";

export class BetterShapeMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
