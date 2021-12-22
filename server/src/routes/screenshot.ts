import path from "path";
import fs from "fs";
import express from "express";
import crypto from "crypto";
import cors from "cors";

import { fail, wrapAsync } from "../utils";
import { SCREENSHOTS_DIR } from "../config";

// Currently incompatible with ES6 import, so use `require`:
const capture = require("capture-website");

export const screenshot = express.Router();

screenshot.use(express.static(SCREENSHOTS_DIR)).get(
  /^\/([\dx]+)\/(http.+)$/,
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
