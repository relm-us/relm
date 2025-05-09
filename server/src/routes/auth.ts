import express from "express"
import cors from "cors"
import passport from "passport"
import { type Appearance, getDefaultAppearance, type SavedIdentityData } from "relm-common"

import * as middleware from "../middleware.js"
import { Participant, Permission, User } from "../db/index.js"
import {
  respondWithSuccess,
  respondWithError,
  wrapAsync,
  intersection,
  isValidEmailFormat,
  isValidIdentity,
  isValidPasswordFormat,
  wrapAsyncPassport,
  PassportResponse,
  respondWithErrorPostMessage,
  respondWithSuccessPostMessage,
} from "../utils/index.js"

export const auth = express.Router()

auth.post(
  "/permissions",
  cors(),
  middleware.authenticated(),
  middleware.acceptJwt(),
  wrapAsync(async (req, res) => {
    if (!req.body.relms) {
      return respondWithError(res, "relms required")
    }

    let permissions = {}

    if (req.jwtRaw) {
      const relmsRequested = new Set(req.body.relms)
      const relmsDecoded = new Set(Object.keys(req.jwtRaw.relms))
      for (const relmName in intersection(relmsRequested, relmsDecoded)) {
        permissions[relmName] = relmsDecoded[relmName]
      }
    } else {
      permissions = await Permission.getPermissions({
        participantId: req.authenticatedParticipantId,
        relmNames: req.body.relms,
      })
    }

    respondWithSuccess(res, {
      action: "permitted",
      permissions,
      jwt: req.jwtRaw,
    })
  }),
)

// Return any user data associated with the provided participant id.
auth.get(
  "/identity",
  cors(),
  middleware.authenticated(),
  wrapAsync(async (req, res) => {
    const userId = await Participant.getUserId({
      participantId: req.authenticatedParticipantId,
    })

    if (userId === null) {
      return respondWithSuccess(res, {
        isConnected: false,
        identity: null,
      })
    }

    const identity = await User.getIdentityData({ userId })
    respondWithSuccess(res, {
      isConnected: true,
      identity,
    })
  }),
)

// Update the appearance data of a participant id associated with a user.
auth.post(
  "/identity",
  cors(),
  middleware.authenticated(),
  middleware.authenticatedWithUser(),
  wrapAsync(async (req, res) => {
    const userId = req.authenticatedUserId
    const { identity: identityPayload } = req.body
    if (identityPayload === null) {
      return respondWithError(res, "missing identity in payload")
    }

    if (!isValidIdentity(identityPayload)) {
      return respondWithError(res, "invalid identity")
    }

    const appearancePayload = identityPayload.appearance || getDefaultAppearance("male")
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
      fantasySkinColor: appearancePayload.fantasySkinColor,
      hairColor: appearancePayload.hairColor,
      topColor: appearancePayload.topColor,
      bottomColor: appearancePayload.bottomColor,
      beltColor: appearancePayload.beltColor,
      shoeColor: appearancePayload.shoeColor,
    }

    const identity: SavedIdentityData = {
      name: identityPayload.name,
      color: identityPayload.color,
      status: identityPayload.status,
      equipment: identityPayload.equipment,
      appearance,
    }

    await User.setIdentityData({
      userId,
      identity,
    })

    respondWithSuccess(res, {})
  }),
)

auth.post(
  "/connect/local/signup",
  cors(),
  middleware.authenticated(),
  wrapAsync(async (req, res) => {
    const { email, password } = req.body

    // Check that the email is valid
    if (!isValidEmailFormat(email)) {
      return respondWithError(res, "invalid_email")
    }

    if (!isValidPasswordFormat(password)) {
      return respondWithError(res, "invalid_password")
    }

    // Check if someone is using that email
    const userExistsWithEmailProvided = (await User.getUserIdByEmail({ email })) !== null
    if (userExistsWithEmailProvided) {
      return respondWithError(res, "email_already_used")
    }

    // Ensure the participant being registered isn't already linked.
    const participantId = req.authenticatedParticipantId
    const existingUserId = await Participant.getUserId({ participantId })
    if (existingUserId !== null) {
      return respondWithError(res, "participant_already_linked")
    }

    const userId = await User.createUser({
      email,
      password,
    })
    await Participant.assignToUserId({ participantId, userId })

    return respondWithSuccess(res, {})
  }),
)

auth.post(
  "/connect/local/signin",
  cors(),
  middleware.authenticated(),
  wrapAsyncPassport("local", async (req, res, _, status, data) => {
    // Was authentication successful?
    if (status === PassportResponse.ERROR) {
      return respondWithError(res, data.reason, data.details)
    }

    if (status === PassportResponse.FAILURE) {
      return respondWithError(res, data.reason, data.details)
    }

    if (status === PassportResponse.NO_USER_FOUND) {
      return respondWithError(res, "invalid_credentials", {
        email: req.body?.email,
        passwordLength: req.body?.password?.length,
        participantId: req.authenticatedParticipantId,
      })
    }

    // Authentication was successful! Ensure the participant is not linked to another user already.
    const participantId = req.authenticatedParticipantId
    const existingUserId = await Participant.getUserId({ participantId })
    if (existingUserId !== null && data !== existingUserId) {
      return respondWithError(res, "participant_already_linked")
    }

    // Assign participant to user!
    await Participant.assignToUserId({ userId: data, participantId })

    respondWithSuccess(res, {})
  }),
)

// OAuth routes

function socialOAuthRedirect(socialId, scope?) {
  return (req, res, next) => {
    const options: any = {
      state: req.query.state as string,
      session: true,
    }
    if (scope) {
      options.scope = scope
    }

    req.session.participantId = req.authenticatedParticipantId

    // Store the participantId under this cookie's session for validation after the oAuth callback.
    passport.authenticate(socialId, options)(req, res, next)
  }
}

function socialOAuthCallback(socialId) {
  return (req, res, next) =>
    wrapAsyncPassport(socialId, async (req, res, _, status, data) => {
      if (status === PassportResponse.ERROR) {
        return respondWithErrorPostMessage(res, data.reason, data.details)
      }

      if (status === PassportResponse.FAILURE) {
        return respondWithErrorPostMessage(res, data.reason, data.details)
      }

      // Assign participant to user!
      const participantId = req.session.participantId
      await Participant.assignToUserId({ userId: data, participantId })

      // Tell the browser to close the window to let the client know authentication was successful.
      respondWithSuccessPostMessage(res, {})
    })(req, res, next)
}

auth.get("/connect/google", cors(), middleware.authenticatedForOAuth(), socialOAuthRedirect("google"))
auth.get("/connect/google/callback", cors(), middleware.authenticatedForOAuth(), socialOAuthCallback("google"))

auth.get("/connect/linkedin", cors(), middleware.authenticatedForOAuth(), socialOAuthRedirect("linkedin"))
auth.get("/connect/linkedin/callback", cors(), middleware.authenticatedForOAuth(), socialOAuthCallback("linkedin"))

auth.get("/connect/facebook", cors(), middleware.authenticated(), socialOAuthRedirect("facebook", ["email"]))
auth.get("/connect/facebook/callback", cors(), middleware.authenticated(), socialOAuthCallback("facebook"))

auth.get("/connect/twitter", cors(), middleware.authenticated(), socialOAuthRedirect("twitter"))
auth.get("/connect/twitter/callback", cors(), middleware.authenticated(), socialOAuthCallback("twitter"))
