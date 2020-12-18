const fs = require("fs");
const path = require("path");
const md5File = require("md5-file");

const config = require("./config.js");

async function getContentAddressableName(filepath, fallbackExtension = null) {
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

async function moveAndRenameContentAddressable(filepath, extension = null) {
  const contentAddressableName = await getContentAddressableName(
    filepath,
    extension
  );
  const destination = path.join(config.ASSETS_DIR, contentAddressableName);

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
      throw err;
    }
  }
}

function getFileSizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

function fileUploadSuccess(res, files = {}) {
  res.writeHead(200, config.CONTENT_TYPE_JSON);
  res.end(
    JSON.stringify({
      status: "success",
      files,
    })
  );
}

module.exports = {
  getContentAddressableName,
  moveAndRenameContentAddressable,
  getFileSizeInBytes,
  fileUploadSuccess,
};
