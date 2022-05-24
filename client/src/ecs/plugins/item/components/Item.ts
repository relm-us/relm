import { Component, StringType } from "~/ecs/base";

export class Item extends Component {
  static props = {
    power: {
      type: StringType,
      editor: {
        label: "Power",
      },
    },

    attach: {
      type: StringType,
      editor: {
        label: "Attach To",
        input: "Select",
        options: [
          { label: "Right Hand", value: "HAND" },
          { label: "Head", value: "HEAD" },
          { label: "Back", value: "BACK" },
        ],
      },
    },
  };

  static editor = {
    label: "Item",
  };
}
