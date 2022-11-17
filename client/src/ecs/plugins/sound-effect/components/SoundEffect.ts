import { Component } from "~/ecs/base";
import { AssetType } from "~/ecs/plugins/core";

export class SoundEffect extends Component {
  asset: string;

  static props = {
    asset: {
      type: AssetType,
      editor: {
        label: "Sound Asset",
      },
    },
  };

  static editor = {
    label: "Sound Effect",
  };
}
