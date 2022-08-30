import { Component, StringType, BooleanType } from "~/ecs/base";
import { Asset, AssetType } from "../../core";

export class WebPage extends Component {
  url: string;
  fit: "COVER" | "CONTAIN";
  asset: Asset;

  static props = {
    url: {
      type: StringType,
      default: "https://google.com?igu=1",
      editor: {
        label: "URL",
      },
    },

    fit: {
      type: StringType,
      default: "COVER",
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
  };

  static editor = {
    label: "WebPage",
  };
}
