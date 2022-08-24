import { Component, StringType, BooleanType } from "~/ecs/base";
import { AssetType } from "../../core";

export class WebPage extends Component {
  url: string;
  alwaysOn: boolean;

  static props = {
    url: {
      type: StringType,
      default: "https://google.com?igu=1",
      editor: {
        label: "URL",
      },
    },

    asset: {
      type: AssetType,
      editor: {
        label: "Cover Image",
        accept: ".png,.jpg,.jpeg",
      },
    },
  };

  static editor = {
    label: "WebPage",
  };
}
