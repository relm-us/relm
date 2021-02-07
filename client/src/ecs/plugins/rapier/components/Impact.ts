import { Component, JSONType } from "hecs";

export class Impact extends Component {
  static props = {
    others: {
      type: JSONType,
      editor: {
        label: "Other Entities' Impact Magnitudes",
      },
    },
  };
}
