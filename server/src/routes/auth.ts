import express from "express";
import cors from "cors";

import * as middleware from "../middleware.js";
import { Participant, Permission, User } from "../db/index.js";
import {
  respondWithSuccess,
  respondWithError,
  wrapAsync,
  intersection,
  wrapAsyncPassport
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
          participantId: req.authenticatedParticipantId,
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

// Return any user data associated with the provided participant id.
auth.get(
  "/identity",
  cors(),
  middleware.authenticated(),
  wrapAsync(async (req, res) => {
      const userId = await Participant.getUserId(req.authenticatedParticipantId); 
      if (userId === null) {
        return respondWithSuccess(res, {
          appearance: null
        });
      }
      
      const appearance = await User.getAppearanceData({ userId });

      respondWithSuccess(res, {
        appearance
      });
  })
);

// Social logins
auth.post(
  "/connect",
  cors(),
  middleware.authenticated(),
  wrapAsyncPassport("local", async (req, res, next, userId) => {
    // Authentication was successful! Link the participant to the user.
    const participantId = req.authenticatedParticipantId;

    await Participant.assignToUserId({
      userId,
      participantId
    });

    respondWithSuccess(res, {});
  })
);