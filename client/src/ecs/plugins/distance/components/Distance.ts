import { LocalComponent, StringType } from "~/ecs/base";

export class Distance extends LocalComponent {
  static props = {
    target: {
      type: StringType,
      editor: {
        label: "Target Entity",
        input: "Entity",
      },
    },
  };

  static editor = {
    label: "Distance",
  };
}
