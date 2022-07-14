import { BooleanType, Component } from "~/ecs/base";

export class Model2 extends Component {
  compat: boolean;

  static props = {
    compat: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Compatibility Mode",
      },
    },
  };

  static editor = {
    label: "Model",
  };
}
