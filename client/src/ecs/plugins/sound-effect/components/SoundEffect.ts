import { BooleanType, Component } from "~/ecs/base";
import { Asset, AssetType } from "~/ecs/plugins/core";

export class SoundEffect extends Component {
  asset: Asset;
  preload: boolean;

  static props = {
    asset: {
      type: AssetType,
      editor: {
        label: "Sound Asset (.webm)",
      },
    },

    preload: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Preload Asset",
      },
    },
  };

  static editor = {
    label: "Sound Effect",
  };
}
