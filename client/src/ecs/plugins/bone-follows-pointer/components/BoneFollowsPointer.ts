import { BooleanType, Component, StringType } from "~/ecs/base";

export class BoneFollowsPointer extends Component {
  boneName: string;

  static props = {
    boneName: {
      type: StringType,
      default: null,
      editor: {
        label: "Bone Name",
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
