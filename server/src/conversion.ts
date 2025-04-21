import fs from "node:fs"
import path from "node:path"
import md5File from "md5-file"
import { useSpaces, uploadToSpaces } from "./lib/spaces.js"

import { config } from "./config.js"

const { ASSETS_DIR, CONTENT_TYPE_JSON } = config

export async function moveOrUploadContentAddressable(filepath, extension = null) {
  if (useSpaces()) {
    return await uploadContentAddressable(filepath, extension)
  }

  return await moveAndRenameContentAddressable(filepath, extension)
}

export async function uploadContentAddressable(filepath, extension) {
  const contentAddressableName = await getContentAddressableName(filepath, extension)

  console.log(`uploading ${filepath} to cloud as ${contentAddressableName}...`)
  await uploadToSpaces(filepath, contentAddressableName)

  // clean up
  await fs.promises.unlink(filepath)

  return contentAddressableName
}

export async function moveAndRenameContentAddressable(filepath, extension = null) {
  const contentAddressableName = await getContentAddressableName(filepath, extension)

  console.log(`saving ${filepath} locally as ${contentAddressableName}...`)
  const destination = path.join(ASSETS_DIR, contentAddressableName)

  try {
    // Check if destination already exists. If content-addressable file exists,
    // we need not overwrite it because we are guaranteed its content is the same
    await fs.promises.access(destination)

    // clean up
    await fs.promises.unlink(filepath)
  } catch (accessError) {
    if (accessError.code === "ENOENT") {
      await fs.promises.rename(filepath, destination)
    } else {
      throw accessError
    }
  }

  return contentAddressableName
}

export async function getContentAddressableName(filepath, fallbackExtension = null) {
  const hash = await md5File(filepath)
  const fileSize = getFileSizeInBytes(filepath)
  let extension = path.extname(filepath)

  if (extension === "") {
    if (fallbackExtension) {
      extension = fallbackExtension
    } else {
      throw Error(`File has no extension: '${filepath}'`)
    }
  }

  return `${hash}-${fileSize}${extension}`
}

export function getFileSizeInBytes(filename) {
  const stats = fs.statSync(filename)
  const fileSizeInBytes = stats.size
  return fileSizeInBytes
}

export function fileUploadSuccess(res, files = {}) {
  res.writeHead(200, CONTENT_TYPE_JSON)
  res.end(
    JSON.stringify({
      status: "success",
      files,
    }),
  )
}
