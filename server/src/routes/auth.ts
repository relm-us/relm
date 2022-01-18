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
      let permits = {};
      let participantNameOverride = null;

      if (req.jwtData) {
        participantNameOverride = req.jwtData.username;

        const relmsRequested = new Set(req.body.relms);
        const relmsDecoded = new Set(Object.keys(req.jwtData.relms));
        for (let relmName in intersection(relmsRequested, relmsDecoded)) {
          permits[relmName] = relmsDecoded[relmName];
        }
      } else {
        permits = await Permission.getPermissions({
          playerId: req.authenticatedPlayerId,
          relmNames: req.body.relms,
        });
      }

      respond(res, 200, {
        status: "success",
        permits,
        participantNameOverride,
      });
    }
  })
);
