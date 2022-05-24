import { LocalComponent, StringType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";

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

    offset: {
      type: Vector3Type,
      editor: {
        label: "Offset",
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
