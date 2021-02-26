import { get } from "svelte/store";
import { config } from "./store";

export function assetUrl(filename) {
  const $config = get(config);
  return `${$config.serverUploadUrl}/${filename}`;
}
