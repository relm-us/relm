import path from "path";
import express from "express";
import fileupload from "express-fileupload";
import cors from "cors";
import sharp from "sharp";

import * as middleware from "../middleware";
import * as conversion from "../conversion";
import * as util from "../utils";
import { fail, wrapAsync } from "../utils";

import { Asset } from "../db";

export const asset = express.Router();

import {
  TMP_DIR,
  ASSETS_DIR,
  MAX_FILE_EXTENSION_LENGTH,
  MAX_FILE_SIZE,
} from "../config";

// Allow files to be uploaded.
// NOTE: This must be before app.post('/asset')
asset.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: TMP_DIR,
  }) as any
);

// Add asset metadata to the library
asset.post(
  "/library/create",
  cors(),
  middleware.authenticated(),
  middleware.authorized("admin"),
  wrapAsync(async (req, res) => {
    let name: string = req.body.name;
    let description: string = req.body.description;
    let thumbnail: string = req.body.thumbnail;
    let tags: string[] = req.body.tags;
    let ecsProperties: any = req.body.ecsProperties;

    const asset = await Asset.createAsset({
      name,
      description,
      thumbnail,
      tags: tags,
      ecsProperties,
      createdBy: req.authenticatedPlayerId,
    });

    return util.respond(res, 200, {
      status: "success",
      action: "create",
      asset,
    });
  })
);

asset.delete(
  "/library/delete",
  cors(),
  middleware.authenticated(),
  middleware.authorized("admin"),
  wrapAsync(async (req, res) => {
    let assetId: string = req.body.assetId;

    const deleted = await Asset.deleteAsset({ assetId });
    
    return util.respond(res, 200, {
      status: "success",
      action: "delete",
      deleted,
    });
  })
);

asset.post(
  "/library/query",
  cors(),
  // middleware.authenticated(),
  wrapAsync(async (req, res) => {
    let keywords: string[] = req.body.keywords;
    let tags: string[] = req.body.tags;
    let page: number = req.body.page ?? 0;
    let per_page: number = req.body.per_page ?? 10;

    if (page < 0) page = 0;
    if (per_page < 0) per_page = 0;
    if (per_page > 100) per_page = 100;

    const assets = await Asset.queryAssets({ keywords, tags, page, per_page });

    return util.respond(res, 200, {
      status: "success",
      action: "query",
      assets,
    });
  })
);

// Serve uploaded files
asset.use(
  express.static(ASSETS_DIR, {
    setHeaders: (res, path, stat) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET");
      res.header("Access-Control-Allow-Headers", "Content-Type");
    },
  })
);

// Upload images and 3D assets
asset.post(
  "/upload",
  cors(),
  // middleware.authenticated(),
  // middleware.authorized("edit"),
  wrapAsync(async (req, res) => {
    if (!("file" in req.files)) {
      return fail(res, "expecting file form-data");
    }

    // TODO: turn on `batch: true` and change this to one-or-many
    //   - attribute would change from "file" to "files[]"
    //   - asset becomes single asset in case of 1 file uploaded
    //   - assets become array of assets in case of 2+ files
    //   - ?? how do we respond to Uppy for errors in just 1 of several?
    const asset = req.files["file"];
    if (asset.size > MAX_FILE_SIZE) {
      return fail(res, "file too large");
    }

    const extension = path.extname(asset.name).toLowerCase();
    if (extension.length > MAX_FILE_EXTENSION_LENGTH) {
      return fail(res, "file extension too long");
    }

    try {
      switch (extension) {
        case ".jpg":
        case ".jpeg":
        case ".gif":
        case ".png":
        case ".webp":
          const pngTempFile = asset.tempFilePath + ".png";
          await sharp(asset.tempFilePath).toFile(asset.tempFilePath + ".png");
          const png = await conversion.moveOrUploadContentAddressable(
            pngTempFile
          );

          const webpTempFile = asset.tempFilePath + ".webp";
          await sharp(asset.tempFilePath).toFile(asset.tempFilePath + ".webp");
          const webp = await conversion.moveOrUploadContentAddressable(
            webpTempFile
          );

          return conversion.fileUploadSuccess(res, { png, webp });

        case ".glb":
        case ".packed-glb":
        case ".gltf":
        case ".packed-gltf":
          const gltf = await conversion.moveOrUploadContentAddressable(
            asset.tempFilePath,
            extension
          );
          return conversion.fileUploadSuccess(res, { gltf });

        default:
          return fail(res, "unsupported filetype");
      }
    } catch (err) {
      return fail(res, err);
    }
  })
);
