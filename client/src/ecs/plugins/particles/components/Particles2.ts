import { Color, Vector3 } from "three"

import { Component, LocalComponent, StateComponent, RefType, StringType, BooleanType, NumberType } from "~/ecs/base"
import { Vector3Type } from "~/ecs/plugins/core"

import { textures } from "../textures"

export class Particles2 extends Component {
  pattern: "STILL" | "EXPLODE" | "RING" | "TRAILS" | "RAINING"
  params: Vector3

  sprite: string

  onTop: boolean

  startColor: string
  endColor: string

  offset: Vector3
  sizeMin: number
  sizeMax: number
  initialCount: number
  rate: number
  maxParticles: number
  particleLt: number
  effectLt: number
  fadeIn: number
  fadeOut: number

  // cache
  gamma: number = 0
  theta: number = 0

  static props = {
    pattern: {
      type: StringType,
      default: "STILL",
      editor: {
        label: "Pattern Motion",
        input: "Select",
        options: [
          { label: "Still", value: "STILL" },
          { label: "Explode", value: "EXPLODE" },
          { label: "Ring", value: "RING" },
          { label: "Trails", value: "TRAILS" },
          { label: "Raining", value: "RAINING" },
        ],
      },
    },

    // Misc params, used differently by each pattern
    params: {
      type: Vector3Type,
      editor: {
        label: "Pattern Params",
        requires: [
          { prop: "pattern", value: "STILL", labels: ["w", "h", "d"] },
          { prop: "pattern", value: "EXPLODE", labels: ["vx", "vy", "vz"] },
          { prop: "pattern", value: "RING", labels: ["r", "vr", "vc"] },
          { prop: "pattern", value: "TRAILS", labels: ["r", "x", "y"] },
          { prop: "pattern", value: "RAINING", labels: ["w", "h", "d"] },
        ],
      },
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
      editor: {
        label: "Offset",
      },
    },

    sprite: {
      type: StringType,
      default: "circle_05",
      editor: {
        label: "Sprite",
        input: "Select",
        options: Object.keys(textures).map((key) => ({
          label: key,
          value: key,
        })),
      },
    },

    onTop: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Top Layer?",
      },
    },

    startColor: {
      type: StringType,
      default: "#" + new Color(1.0, 0.0, 1.0).getHexString(),
      editor: {
        label: "Start Color",
        input: "Color",
      },
    },

    endColor: {
      type: StringType,
      default: "#" + new Color(0.0, 1.0, 1.0).getHexString(),
      editor: {
        label: "End Color",
        input: "Color",
      },
    },

    sizeMin: {
      type: NumberType,
      default: 30,
      editor: {
        label: "Size (Min)",
      },
    },

    sizeMax: {
      type: NumberType,
      default: 30,
      editor: {
        label: "Size (Max)",
      },
    },

    initialCount: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Initial P. Count",
      },
    },

    rate: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Rate of Creation",
      },
    },

    maxParticles: {
      type: NumberType,
      default: 1000,
      editor: {
        label: "Max Particles",
      },
    },

    particleLt: {
      type: NumberType,
      default: 2.0,
      editor: {
        label: "Particle Lifetime (sec)",
      },
    },

    effectLt: {
      type: NumberType,
      default: 0.0,
      editor: {
        label: "Effect Lifetime (sec)",
      },
    },

    fadeIn: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Fade In (sec)",
      },
    },

    fadeOut: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Fade Out (sec)",
      },
    },
  }

  static editor = {
    label: "Particles",
  }
}

export class ParticlesRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  }
}

export class ParticlesLoading extends LocalComponent {}
