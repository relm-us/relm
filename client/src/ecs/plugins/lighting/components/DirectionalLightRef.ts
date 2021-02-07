import { StateComponent, RefType } from "hecs";

export class DirectionalLightRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
