import path from "path";
import fs from "fs";
import express from "express";
import crypto from "crypto";

import { respondWithError, wrapAsync } from "../utils/index.js";
import { SCREENSHOTS_DIR } from "../config.js";

// Currently incompatible with ES6 import, so use `require`:
// const capture = (await import("capture-website")).default;
import capture from 'capture-website';

export const screenshot = express.Router();

screenshot.use(express.static(SCREENSHOTS_DIR)).get(
  /^\/([\dx]+)\/(http.+)$/,
  wrapAsync(async (req, res) => {
    if (!capture) {
      return respondWithError(res, "capture-website not installed on server");
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
      console.log("Taking screenshot", url);
      await capture.file(url, filepath, { type: "jpeg", width, height });
    }

    // jpeg
    res.sendFile(filepath);
  })
);
