import { LocalComponent } from "~/ecs/base";
import { AssetType } from "~/ecs/plugins/core";

export class Asset extends LocalComponent {
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
