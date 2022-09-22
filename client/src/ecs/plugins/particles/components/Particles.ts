import { Color, Vector3 } from "three";

import {
  Component,
  LocalComponent,
  StateComponent,
  RefType,
  StringType,
  BooleanType,
  NumberType,
} from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";

import { textures } from "../textures";

export class Particles extends Component {
  pattern: "DISPERSE_3D" | "DISPERSE_2D" | "GATEWAY" | "TRAILS";
  params: Vector3;

  sprite: string;

  enabled: boolean;
  onTop: boolean;
  relative: boolean;

  startColor: string;
  endColor: string;

  offset: Vector3;
  sizeMin: number;
  sizeMax: number;
  rate: number;
  maxParticles: number;
  particleLt: number;
  effectLt: number;
  fadeIn: number;
  fadeOut: number;

  // cache
  gamma: number = 0;
  theta: number = 0;

  static props = {
    pattern: {
      type: StringType,
      default: "DISPERSE_3D",
      editor: {
        label: "Pattern Motion",
        input: "Select",
        options: [
          { label: "Disperse (3D)", value: "DISPERSE_3D" },
          { label: "Disperse (2D)", value: "DISPERSE_2D" },
          { label: "Gateway", value: "GATEWAY" },
          { label: "Trails", value: "TRAILS" },
        ],
      },
    },

    // Misc params, used differently by each pattern
    params: {
      type: Vector3Type,
      editor: {
        label: "Pattern Params",
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

    enabled: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Enabled?",
        // Tell the BooleanType.svelte to quietly change the value (no `.modified()`)
        skipModify: true,
      },
    },

    onTop: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Top Layer?",
      },
    },

    relative: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Relative?",
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
  };

  static editor = {
    label: "Particles",
  };
}

export class ParticlesRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}

export class ParticlesLoading extends LocalComponent {}
