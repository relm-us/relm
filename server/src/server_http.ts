import path from "path";
import fs from "fs";
import express from "express";
import bodyParser from "body-parser";
import fileupload from "express-fileupload";
import cors from "cors";
import sharp from "sharp";
import crypto from "crypto";

import * as conversion from "./conversion";
import { respond, fail, uuidv4, wrapAsync, getRemoteIP } from "./util";
import * as middleware from "./middleware";
import { relmRouter } from "./relm_router";
import { Relm, Permission } from "./db";

import {
  SCREENSHOTS_DIR,
  TMP_DIR,
  ASSETS_DIR,
  MAX_FILE_EXTENSION_LENGTH,
  MAX_FILE_SIZE,
} from "./config";

const capture = require("capture-website");

export const app = express();

// Automatically parse JSON body when received in REST requests
app.use(bodyParser.json());

// Enable CORS pre-flight requests across the board
// See https://expressjs.com/en/resources/middleware/cors.html#enabling-cors-pre-flight
app.options("*", cors());

// Courtesy page just to say we're a Relm web server
app.get("/", function (_req, res) {
  res.send("Relm Server is OK");
});

app.post(
  "/authenticate",
  cors(),
  middleware.authenticated(),
  middleware.acceptToken(),
  wrapAsync(async (req, res) => {
    respond(res, 200, {
      status: "success",
      action: "authenticate",
    });
  })
);

app.post(
  "/mkadmin",
  cors(),
  middleware.authenticated(),
  middleware.authorized("admin"),
  wrapAsync(async (req, res) => {
    const permits: Array<Permission.Permission> = [
      "admin",
      "access",
      "invite",
      "edit",
    ];
    await Permission.setPermissions({
      playerId: req.body.playerId,
      permits,
    });
    respond(res, 200, {
      status: "success",
      action: "mkadmin",
      permits: permits,
    });
  })
);

app.get(
  "/relms/all",
  cors(),
  middleware.authenticated(),
  middleware.authorized("admin"),
  wrapAsync(async (req, res) => {
    const relms = await Relm.getAllRelms({});
    respond(res, 200, {
      status: "success",
      relms,
    });
  })
);

app.get(
  "/relms/public",
  cors(),
  wrapAsync(async (req, res) => {
    const relms = await Relm.getAllRelms({ isPublic: true });
    respond(res, 200, {
      status: "success",
      relms,
    });
  })
);

app.use("/relm/:relmName", middleware.relmName(), relmRouter);

app.use(express.static(SCREENSHOTS_DIR)).get(
  /^\/screenshot\/([\dx]+)\/(http.+)$/,
  wrapAsync(async (req, res) => {
    if (!capture) {
      return fail(res, "capture-website not installed on server");
    }
    const { 0: size, 1: url } = req.params;
    const [width, height] = (size || "800x600")
      .split("x")
      .map((n) => parseInt(n, 10));

    const hash = crypto.createHash("md5").update(url).digest("hex");
    const filename = hash + ".jpg";

    const filepath = path.resolve(path.join(SCREENSHOTS_DIR, filename));
    if (!fs.existsSync(filepath)) {
      // Website screen capture hasn't been taken yet
      await capture.file(url, filepath, { type: "jpeg", width, height });
    }

    // jpeg
    console.log("filepath", filepath);
    res.sendFile(filepath);
  })
);

// Serve uploaded files
app.use(
  "/asset",
  express.static(ASSETS_DIR, {
    setHeaders: (res, path, stat) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET");
      res.header("Access-Control-Allow-Headers", "Content-Type");
    },
  })
);

// Allow files to be uploaded.
// NOTE: This must be before app.post('/asset')
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: TMP_DIR,
  }) as any
);

// Upload images and 3D assets
app.post(
  "/asset",
  cors(),
  // middleware.authenticated(),
  // middleware.authorized("edit"),
  wrapAsync(async (req, res) => {
    const asset = req.files["files[]"];
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

// Error handling: catch-all for 404s
app.use((req, res) => {
  const code = 404;
  respond(res, code, {
    status: "error",
    code: code,
    reason: `Not found`,
  });
});

// Error handling: general catch-all for errors must be last middleware
// see http://expressjs.com/en/guide/error-handling.html
// see https://thecodebarbarian.com/80-20-guide-to-express-error-handling
app.use((error, req, res, next) => {
  const errorId = uuidv4().split("-")[0];
  const code = error.status || 400;
  console.log(
    `[${getRemoteIP(req)}] ${code} (${errorId}): ${error.message}\n${
      error.stack
    }`
  );
  respond(res, code, {
    status: "error",
    code: code,
    reason: `${error.message} (${errorId})`,
  });
});
