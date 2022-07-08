import { LocalComponent } from "~/ecs/base";
import { AssetType } from "~/ecs/plugins/core";
import { Asset as CoreAsset } from "~/ecs/plugins/core/Asset";

export class Asset extends LocalComponent {
  texture: CoreAsset;
  model: CoreAsset;

  static props = {
    texture: {
      type: AssetType,
      editor: {
        label: "Texture",
        accept: ".png,.jpg,.jpeg,.webp",
      },
    },
    model: {
      type: AssetType,
      editor: {
        label: "Model",
        accept: ".glb,.gltf",
      },
    },
  };
}
