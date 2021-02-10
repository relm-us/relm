import { Component } from "~/ecs/base";
import { AssetType } from "../types/AssetType";

export class Model extends Component {
  static props = {
    asset: {
      type: AssetType,
      editor: {
        label: "Asset",
        accept: ".glb,.gltf",
      },
    },
  };
  static editor = {
    label: "Model",
  };
}
