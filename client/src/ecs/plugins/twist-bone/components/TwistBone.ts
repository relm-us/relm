import {
  LocalComponent,
  BooleanType,
  StringType,
  NumberType,
  RefType,
} from "~/ecs/base";

export class TwistBone extends LocalComponent {
  boneName: string;

  static props = {
    boneName: {
      type: StringType,
      default: null,
      editor: {
        label: "Bone Name",
      },
    },

    function: {
      type: RefType,
      default: (entity) => {
        console.error("TwistBone function required");
        entity.remove(TwistBone);
      },
      editor: {
        label: "Custom twist function",
      },
    },

    speed: {
      type: NumberType,
      default: 0.15,
      editor: {
        label: "Twist Speed",
      },
    },

    enabled: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Enabled?",
      },
    },
  };
}
