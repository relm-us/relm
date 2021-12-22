import express from "express";
import cors from "cors";

import * as middleware from "../middleware";
import { Permission } from "../db";
import { respond, wrapAsync } from "../utils";

export const admin = express.Router();

admin.post(
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

admin.post(
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

