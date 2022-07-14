import { Vector3 } from "three";
import { RefType, LocalComponent, StringType } from "~/ecs/base";

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

  static editor = {
    label: "Line Helper",
  };
}

export class LineHelperRef extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
