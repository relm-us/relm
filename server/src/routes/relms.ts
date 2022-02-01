import express from "express";
import cors from "cors";

import * as middleware from "../middleware";
import { Relm } from "../db";
import { respond, wrapAsync } from "../utils";

export const relms = express.Router();

relms.get(
  "/all",
  cors(),
  middleware.authenticated(),
  middleware.authorized("admin"),
  wrapAsync(async (req, res) => {
    const relms = await Relm.getAllRelms({
      excludeEmpty: req.query["excludeEmpty"] !== "false",
    });
    respond(res, 200, {
      status: "success",
      relms,
    });
  })
);

relms.get(
  "/public",
  cors(),
  wrapAsync(async (req, res) => {
    const relms = await Relm.getAllRelms({ isPublic: true });
    respond(res, 200, {
      status: "success",
      relms,
    });
  })
);
