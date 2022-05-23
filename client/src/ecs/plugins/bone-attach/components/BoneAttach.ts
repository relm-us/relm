import { LocalComponent, StringType } from "~/ecs/base";

export class BoneAttach extends LocalComponent {
  boneName: string;
  entityToAttachId: string;

  static props = {
    boneName: {
      type: StringType,
      default: null,
      editor: {
        label: "Bone Name",
      },
    },

    entityToAttachId: {
      type: StringType,
      default: null,
      editor: {
        label: "Entity to Attach",
      },
    },
  };
}
