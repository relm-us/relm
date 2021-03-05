import { config } from "./store";

export function assetUrl(filename) {
  return `${config.serverUploadUrl}/${filename}`;
}
