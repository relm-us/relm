import fs from "fs";
import path from "path";
import md5File from "md5-file";

import { ASSETS_DIR, CONTENT_TYPE_JSON } from "./config";

export async function getContentAddressableName(
  filepath,
  fallbackExtension = null
) {
  const hash = await md5File(filepath);
  const fileSize = getFileSizeInBytes(filepath);
  let extension = path.extname(filepath);

  if (extension === "") {
    if (fallbackExtension) {
      extension = fallbackExtension;
    } else {
      throw Error(`File has no extension: '${filepath}'`);
    }
  }

  return `${hash}-${fileSize}${extension}`;
}

export async function moveAndRenameContentAddressable(
  filepath,
  extension = null
) {
  const contentAddressableName = await getContentAddressableName(
    filepath,
    extension
  );
  const destination = path.join(ASSETS_DIR, contentAddressableName);

  try {
    // Check if destination already exists. If content-addressable file exists,
    // we need not overwrite it because we are guaranteed its content is the same
    await fs.promises.access(destination);

    console.log(`Skipping 'move file': file already exists (${destination})`);

    // clean up
    await fs.promises.unlink(filepath);

    return path.basename(destination);
  } catch (accessError) {
    if (accessError.code === "ENOENT") {
      console.log(`Moving file to '${destination}'`);

      await fs.promises.rename(filepath, destination);

      return path.basename(destination);
    } else {
      throw accessError;
    }
  }
}

export function getFileSizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

export function fileUploadSuccess(res, files = {}) {
  res.writeHead(200, CONTENT_TYPE_JSON);
  res.end(
    JSON.stringify({
      status: "success",
      files,
    })
  );
}
