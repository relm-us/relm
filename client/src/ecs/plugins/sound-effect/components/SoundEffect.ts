import { BooleanType, Component, NumberType } from "~/ecs/base";
import { Asset, AssetType } from "~/ecs/plugins/core";

export class SoundEffect extends Component {
  asset: Asset;
  preload: boolean;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;

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

    fadeIn: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Fade In (ms)",
        min: 0,
      },
    },

    fadeOut: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Fade Out (ms)",
        min: 0,
      },
    },

    loop: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Loop",
      },
    },
  };

  static editor = {
    label: "Sound Effect",
  };
}
