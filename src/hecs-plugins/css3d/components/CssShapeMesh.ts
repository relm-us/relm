import { StateComponent, RefType } from "hecs";

export class CssShapeMesh extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
