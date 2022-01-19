import express from "express";
import cors from "cors";

import * as middleware from "../middleware";
import { Permission } from "../db";
import { fail, respond, wrapAsync, intersection } from "../utils";

export const auth = express.Router();

auth.post(
  "/permissions",
  cors(),
  middleware.authenticated(),
  middleware.acceptJwt(),
  wrapAsync(async (req, res) => {
    if (!req.body.relms) {
      fail(res, "relms required");
    } else {
      let permissions = {};

      if (req.jwtRaw) {
        const relmsRequested = new Set(req.body.relms);
        const relmsDecoded = new Set(Object.keys(req.jwtRaw.relms));
        for (let relmName in intersection(relmsRequested, relmsDecoded)) {
          permissions[relmName] = relmsDecoded[relmName];
        }
      } else {
        permissions = await Permission.getPermissions({
          playerId: req.authenticatedPlayerId,
          relmNames: req.body.relms,
        });
      }

      respond(res, 200, {
        status: "success",
        permissions,
        jwt: req.jwtRaw,
      });
    }
  })
);
