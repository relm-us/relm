import { Component, StringType } from "~/ecs/base";

export class AudioZone extends Component {
  kind: "ENTER" | "SIT";
  zone: string;

  static props = {
    kind: {
      type: StringType,
      default: "ENTER",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "On Enter", value: "ENTER" },
          { label: "When Seated", value: "SIT" },
        ],
      },
    },

    zone: {
      type: StringType,
      default: "zone-1",
      editor: {
        label: "Zone Name",
      },
    },
  };

  static editor = {
    label: "Audio Zone",
  };
}
