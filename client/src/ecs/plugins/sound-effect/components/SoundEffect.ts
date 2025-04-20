import { BooleanType, Component, NumberType, StringType } from "~/ecs/base"
import { type Asset, AssetType } from "~/ecs/plugins/core"

export class SoundEffect extends Component {
  asset: Asset
  loading: "PRELOAD" | "LAZYLOAD" | "STREAM"
  volume: number
  fadeIn: number
  fadeOut: number
  loop: boolean

  static props = {
    asset: {
      type: AssetType,
      editor: {
        label: "Sound Asset (.webm)",
      },
    },

    loading: {
      type: StringType,
      default: "LAZYLOAD",
      editor: {
        label: "Load Method",
        input: "Select",
        options: [
          { label: "Load as Needed", value: "LAZYLOAD" },
          { label: "Load at Load Screen", value: "PRELOAD" },
          { label: "Streaming Audio", value: "STREAM" },
        ],
      },
    },

    volume: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Volume",
        min: 0,
        max: 1,
        increment: 0.01,
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
  }

  static editor = {
    label: "Sound Effect",
  }
}
