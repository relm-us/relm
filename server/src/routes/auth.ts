import express from "express";
import cors from "cors";
import passport from "passport";
import { Appearance, getDefaultAppearance, SavedIdentityData } from "relm-common";

import * as middleware from "../middleware.js";
import { Participant, Permission, User } from "../db/index.js";
import {
  respondWithSuccess,
  respondWithError,
  wrapAsync,
  intersection,
  isValidIdentity,
  wrapAsyncPassport,
  respondWithFailure,
  PassportResponse
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
      const userId = await Participant.getUserId({
        participantId: req.authenticatedParticipantId
      }); 

      if (userId === null) {
        return respondWithSuccess(res, {
          isConnected: false,
          identity: null
        });
      }
      
      const identity = await User.getIdentityData({ userId });
      respondWithSuccess(res, {
        isConnected: true,
        identity
      });
  })
);

// Update the appearance data of a participant id associated with a user.
auth.post(
  "/identity",
  cors(),
  middleware.authenticated(),
  middleware.authenticatedWithUser(),
  wrapAsync(async (req, res) => {
    const userId = req.authenticatedUserId;
    const { identity : identityPayload } = req.body;
    if (identityPayload === null) {
      return respondWithError(res, "missing identity in payload");
    }

    if (!isValidIdentity(identityPayload)) {
      return respondWithError(res, "invalid identity");
    }

    const appearancePayload = identityPayload.appearance || getDefaultAppearance("male");
    const appearance: Appearance = {
      genderSlider: appearancePayload.genderSlider,
      widthSlider: appearancePayload.widthSlider,
      beard: appearancePayload.beard,
      belt: appearancePayload.belt,
      hair: appearancePayload.hair,
      top: appearancePayload.top,
      bottom: appearancePayload.bottom,
      shoes: appearancePayload.shoes,
      skinColor: appearancePayload.skinColor,
      hairColor: appearancePayload.hairColor,
      topColor: appearancePayload.topColor,
      bottomColor: appearancePayload.bottomColor,
      beltColor: appearancePayload.beltColor,
      shoeColor: appearancePayload.shoeColor
    };

    const identity: SavedIdentityData = {
      name: identityPayload.name,
      color: identityPayload.color,
      status: identityPayload.status,
      showAudio: identityPayload.showAudio,
      showVideo: identityPayload.showVideo,
      equipment: identityPayload.equipment,
      appearance
    };

    await User.setIdentityData({
      userId,
      identity
    });

    respondWithSuccess(res, {});
  })
);



auth.post(
  "/connect/local/signup",
  cors(),
  middleware.authenticated(),
  wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    // Check if someone is using that email
    const userExistsWithEmailProvided = (await User.getUserIdByEmail({ email })) !== null;
    if (userExistsWithEmailProvided) {
      return respondWithFailure(res, "email is already in use");
    }

    const userId = await User.createUser({
      email,
      password
    });

    const participantId = req.authenticatedParticipantId;
    await Participant.assignToUserId({ participantId, userId });

    return respondWithSuccess(res, {});
  })
);

auth.post(
  "/connect/local/login",
  cors(),
  middleware.authenticated(),
  wrapAsyncPassport("local", async (req, res, _, status, data) => {
    // Was authentication successful?
    if (status === PassportResponse.ERROR) {
      return respondWithError(res, data);
    } else if (status === PassportResponse.NO_USER_FOUND) {
      return respondWithFailure(res, "invalid credentials");
    }

    // Authentication was successful! Link the participant to the user.
    const participantId = req.authenticatedParticipantId;
    await Participant.assignToUserId({ 
      userId: data,
      participantId
    });

    respondWithSuccess(res, {});
  })
);

auth.get(
  "/connect/google",
  cors(),
  middleware.authenticated(),
  (req, res, next) => passport.authenticate("google", {
      state: (req.query.state as string)
    })(req, res, next)
);

auth.get(
  "/connect/google/callback",
  cors(),
  middleware.authenticated(),
  wrapAsyncPassport("google", async (req, res, _, status, data) => {
    if (status === PassportResponse.ERROR) {
      return respondWithError(res, data);
    }

    // Authentication was successful! Link the participant to the user.
    const participantId = req.authenticatedParticipantId;
    await Participant.assignToUserId({ userId: data, participantId });

    // Tell the browser to close the window to let the client know authentication was successful.
    res.send("<script>window.close();</script>");
  })
)