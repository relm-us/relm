import express from "express";
import cors from "cors";

import * as middleware from "../middleware";
import { Relm } from "../db";
import { respond, wrapAsync } from "../utils";

export const relmsRouter = express.Router();

relmsRouter.get(
  "/all",
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

relmsRouter.get(
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
