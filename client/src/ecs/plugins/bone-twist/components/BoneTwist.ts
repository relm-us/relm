import { Vector3 } from "three";
import {
  LocalComponent,
  StringType,
  NumberType,
  RefType,
  BooleanType,
} from "~/ecs/base";

export class BoneTwist extends LocalComponent {
  boneName: string;
  function: Vector3;
  speed: number;
  enabled: boolean;

  static props = {
    boneName: {
      type: StringType,
      default: null,
      editor: {
        label: "Bone Name",
      },
    },

    /**
     * A custom function that returns a target position (Vector3) that is in
     * coordinates relative to the bone's position (i.e. bone is at 0,0,0).
     * The bone will rotate (twist) towards that direction.
     *
     * NOTE: currently the twisting is axis-locked to Y.
     * TODO: make axis lock configurable.
     */
    function: {
      type: RefType,
      default: (entity) => {
        console.error("BoneTwist function required");
        entity.remove(BoneTwist);
      },
      editor: {
        label: "Custom twist function",
      },
    },

    speed: {
      type: NumberType,
      default: 0.35,
      editor: {
        label: "Twist Speed",
      },
    },

    enabled: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Enabled",
      },
    },
  };
}
