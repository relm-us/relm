import { Component, StringType, NumberType } from "~/ecs/base"
import { type Asset, AssetType } from "~/ecs/plugins/core"

export class HdImage extends Component {
  asset: Asset
  width: number
  height: number
  fit: "COVER" | "CONTAIN"

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

    caption: {
      type: StringType,
      default: "",
      editor: {
        label: "Caption",
      },
    },

    captionUrl: {
      type: StringType,
      default: "",
      editor: {
        label: "Caption URL",
      },
    },

    captionBg: {
      type: StringType,
      default: "#1a1e23",
      editor: {
        label: "Caption Color",
        input: "Color",
      },
    },
  }

  static editor = {
    label: "HD Image",
  }
}
