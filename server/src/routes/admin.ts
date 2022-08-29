import express from "express";
import cors from "cors";

import * as middleware from "../middleware.js";
import { Permission } from "../db/index.js";
import { respondWithSuccess, wrapAsync } from "../utils/index.js";

export const admin = express.Router();

admin.post(
  "/authenticate",
  cors(),
  middleware.authenticated(),
  middleware.acceptToken(),
  wrapAsync(async (req, res) => {
    respondWithSuccess(res, {
      action: "authenticated",
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
    await Permission.setPermits({
      relmId: "*",
      participantId: req.body.participantId,
      permits,
    });
    respondWithSuccess(res, {
      action: "mkadmin",
      permits: permits,
    });
  })
);
