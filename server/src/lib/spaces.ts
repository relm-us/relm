import fs from "node:fs"
import path from "node:path"
import util from "node:util"
import AWS from "aws-sdk"
import { config } from "../config.js"

const readFile = (fileName) => util.promisify(fs.readFile)(fileName, null /* binary */)

let spaces: AWS.S3

// Whether or not we should upload to Digital Ocean Spaces (object storage)
export function useSpaces() {
  return Boolean(config.SPACES_KEY)
}

// Return an AmazonS3-esque object that can upload to Spaces
export function getSpaces() {
  if (!useSpaces()) return null

  if (!spaces) {
    spaces = new AWS.S3({
      endpoint: new AWS.Endpoint(config.SPACES_ENDPOINT),
      accessKeyId: config.SPACES_KEY,
      secretAccessKey: config.SPACES_SECRET,
    })
  }
  return spaces
}

export async function uploadToSpaces(filepath, name = null) {
  const spaces = getSpaces()
  if (!spaces) return false

  const Key = name || path.basename(filepath)
  const Body = await readFile(filepath)
  console.log("upload", Key, filepath)
  const params = {
    Bucket: config.SPACES_BUCKET,
    Key,
    Body,
    ACL: "public-read",
  }

  await spaces.putObject(params).promise()
  return true
}
