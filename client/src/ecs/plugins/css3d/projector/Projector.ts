import { Component, StringType } from "~/ecs/base";
import { Asset, AssetType } from "~/ecs/plugins/core";

export class Projector extends Component {
  asset: Asset;
  fit: "COVER" | "CONTAIN";

  // The current video stream
  participantId: string;

  static props = {
    fit: {
      type: StringType,
      default: "CONTAIN",
      editor: {
        label: "Fit",
        input: "Select",
        options: [
          { label: "Contain", value: "CONTAIN" },
          { label: "Cover", value: "COVER" },
        ],
      },
    },

    asset: {
      type: AssetType,
      editor: {
        label: "Image",
        accept: ".png,.jpg,.jpeg",
      },
    },

    // Not shown in Editor
    participantId: {
      type: StringType,
    },
  };

  static editor = {
    label: "Projector",
  };
}
