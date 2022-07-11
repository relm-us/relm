import { BooleanType, Component } from "~/ecs/base";

export class Model2 extends Component {
  compat: boolean;

  static props = {
    compat: {
      type: BooleanType,
      label: "Compatibility Mode",
      default: false,
    },
  };

  static editor = {
    label: "Model",
  };
}
