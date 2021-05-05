import { Component } from "~/ecs/base";
import { AssetType } from "~/ecs/plugins/core";

export class Asset extends Component {
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
