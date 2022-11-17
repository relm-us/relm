import { Component, StringType, NumberType } from "~/ecs/base";
import { Asset, AssetType } from "~/ecs/plugins/core";

export class Image extends Component {
  fit: "COVER" | "CONTAIN";
  asset: Asset;
  width: number;
  height: number;

  needsRebuild: boolean;

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
        label: "Image Asset (.png)",
      },
    },

    width: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Width",
      },
    },

    height: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Height",
      },
    },
  };

  static editor = {
    label: "Image",
  };
}
