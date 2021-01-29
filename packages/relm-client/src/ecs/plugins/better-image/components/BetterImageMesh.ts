import { StateComponent, RefType } from "hecs";

export class BetterImageMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
