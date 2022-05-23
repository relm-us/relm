import { Component, StringType } from "~/ecs/base";

export class Item extends Component {
  static props = {
    power: {
      type: StringType,
      editor: {
        label: "Power",
      },
    },
  };

  static editor = {
    label: "Item",
  };
}
