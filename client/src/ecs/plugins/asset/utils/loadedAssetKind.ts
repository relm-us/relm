import { Kind } from "../systems/AssetSystemBase";

export function loadedAssetKind(loaded: { cacheKey: string }): Kind {
  const url = loaded.cacheKey;
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
