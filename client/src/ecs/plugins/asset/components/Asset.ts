import { Component } from "~/ecs/base";
import { AssetType } from "~/ecs/plugins/core";
import { Asset as CoreAsset } from "~/ecs/plugins/core/Asset";

type Kind = "TEXTURE" | "GLTF" | null;
export class Asset extends Component {
  value: CoreAsset;

  static props = {
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

  get url(): string {
    return (this.value?.url || "").toLowerCase();
  }

  get kind(): Kind {
    const url = this.url;
    if (url !== "") {
      // TODO: Get the asset type from MIME info at time of upload
      if (/\.(glb|gltf)$/.test(url)) {
        return "GLTF";
      } else if (/\.(png|jpg|jpeg|webp)$/.test(url)) {
        return "TEXTURE";
      }
    }
    return null;
  }
}
