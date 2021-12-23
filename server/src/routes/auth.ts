import express from "express";
import cors from "cors";

import * as middleware from "../middleware";
import { Permission } from "../db";
import { fail, respond, wrapAsync } from "../utils";

export const auth = express.Router();

auth.post(
  "/permissions",
  cors(),
  middleware.authenticated(),
  wrapAsync(async (req, res) => {
    if (!req.body.relms) {
      fail(res, "relms required");
    } else {
      respond(res, 200, {
        status: "success",
        permits: await Permission.getPermissions({
          playerId: req.authenticatedPlayerId,
          relmNames: req.body.relms,
        }),
      });
    }
  })
);
