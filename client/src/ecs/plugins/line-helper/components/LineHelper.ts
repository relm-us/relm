import { Vector3 } from "three";
import {
  RefType,
  LocalComponent,
  StateComponent,
  StringType,
} from "~/ecs/base";

export class LineHelper extends LocalComponent {
  static props = {
    function: {
      type: RefType,
      default: () => new Vector3(0, 0, 0),
    },

    color: {
      type: StringType,
      default: "#ffffff",
    },
  };
}

export class LineHelperRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
