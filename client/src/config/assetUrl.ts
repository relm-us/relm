import { config } from "./index";

export function assetUrl(filename) {
  return `${config.serverUploadUrl}/${filename}`;
}
