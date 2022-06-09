import { Component, StringType, NumberType } from "~/ecs/base";
import { Asset, AssetType } from "~/ecs/plugins/core";

export class HdImage extends Component {
  asset: Asset;
  width: number;
  height: number;
  fit: "COVER" | "CONTAIN";

  static props = {
    asset: {
      type: AssetType,
      editor: {
        label: "Asset",
        accept: ".png,.jpg,.jpeg",
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
  };

  static editor = {
    label: "HD Image",
  };
}
