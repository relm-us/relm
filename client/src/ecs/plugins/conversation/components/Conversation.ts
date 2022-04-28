import { BooleanType, Component, StringType } from "~/ecs/base";
import { AssetType, Asset } from "~/ecs/plugins/core";

export class Conversation extends Component {
  title: string;
  image: Asset;
  content: string;
  visible: boolean;

  static props = {
    title: {
      type: StringType,
      default: null,
      editor: {
        label: "Name",
      },
    },

    image: {
      type: AssetType,
      default: null,
      editor: {
        label: "Image",
        accept: ".png,.jpg,.jpeg,.webp",
      },
    },

    content: {
      type: StringType,
      default: null,
      editor: {
        label: "HTML Content",
      },
    },

    visible: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Visible",
      },
    },
  };

  static editor = {
    label: "Conversation",
  };
}
