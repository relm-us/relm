import express from "express";
import cors from "cors";

import * as middleware from "../middleware.js";
import { Permission } from "../db/index.js";
import {
  respondWithSuccess,
  respondWithError,
  wrapAsync,
  intersection,
} from "../utils/index.js";

export const auth = express.Router();

auth.post(
  "/permissions",
  cors(),
  middleware.authenticated(),
  middleware.acceptJwt(),
  wrapAsync(async (req, res) => {
    if (!req.body.relms) {
      return respondWithError(res, "relms required");
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

      respondWithSuccess(res, {
        action: "permitted",
        permissions,
        jwt: req.jwtRaw,
      });
    }
  })
);
