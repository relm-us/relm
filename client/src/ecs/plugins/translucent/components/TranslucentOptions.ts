import { BooleanType, Component } from "~/ecs/base";

export class TranslucentOptions extends Component {
  opaque: boolean;
  twoSided: boolean;
  
  static props = {
    opaque: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Opaque?",
      },
    },

    twoSided: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Two-sided?",
      },
    },
  };

  static editor = {
    label: "Translucent Options",
  };
}
