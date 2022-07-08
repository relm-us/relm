import { LocalComponent, StringType } from "~/ecs/base";
import { AssetType } from "~/ecs/plugins/core";
import { Asset as CoreAsset } from "~/ecs/plugins/core/Asset";

export class Asset extends LocalComponent {
  kind: "TEXTURE" | "MODEL";
  value: CoreAsset;

  static props = {
    kind: {
      type: StringType,
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "Texture", value: "TEXTURE" },
          { label: "3D Model", value: "MODEL" },
        ],
      },
    },

    value: {
      type: AssetType,
      editor: {
        label: "File",
      },
    },
  };

  static editor = {
    label: "Asset",
  };
}
