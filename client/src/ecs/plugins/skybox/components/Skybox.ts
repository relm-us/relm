import { Component } from "~/ecs/base";
import { AssetType } from "~/ecs/plugins/core";

export class Skybox extends Component {
  static props = {
    image: {
      type: AssetType,
      editor: {
        label: "Image Asset",
        accept: ".jpg,.png,.webp",
      },
    },
  };
}
