import fs from "fs";
import path from "path";
import util from "util";
import AWS from "aws-sdk";
import {
  SPACES_KEY,
  SPACES_SECRET,
  SPACES_BUCKET,
  SPACES_ENDPOINT,
} from "./config";

const readFile = (fileName) =>
  util.promisify(fs.readFile)(fileName, null /* binary */);

let spaces;

// Whether or not we should upload to Digital Ocean Spaces (object storage)
export function useSpaces() {
  return !!SPACES_KEY;
}

// Return an AmazonS3-esque object that can upload to Spaces
export function getSpaces() {
  if (!useSpaces()) return null;

  if (!spaces) {
    spaces = new AWS.S3({
      endpoint: new AWS.Endpoint(SPACES_ENDPOINT),
      accessKeyId: SPACES_KEY,
      secretAccessKey: SPACES_SECRET,
    });
  }
  return spaces;
}

export async function uploadToSpaces(filepath, name = null) {
  const spaces = getSpaces();
  if (!spaces) return false;

  const Key = name || path.basename(filepath);
  const Body = await readFile(filepath);
  console.log("upload", Key, filepath);
  var params = {
    Bucket: SPACES_BUCKET,
    Key,
    Body,
    ACL: "public-read",
  };

  await spaces.putObject(params).promise();
  return true;
}
