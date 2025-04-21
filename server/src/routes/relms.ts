import express from "express"
import cors from "cors"

import * as middleware from "../middleware.js"
import { Relm } from "../db/index.js"
import { respondWithSuccess, wrapAsync } from "../utils/index.js"

export const relms = express.Router()

relms.get(
  "/all",
  cors(),
  middleware.authenticated(),
  middleware.authorized("admin"),
  wrapAsync(async (req, res) => {
    const relms = await Relm.getAllRelms({
      includeEmpty: req.query["includeEmpty"] === "1",
    })
    respondWithSuccess(res, {
      action: "getRelms",
      relms,
    })
  }),
)

relms.get(
  "/public",
  cors(),
  wrapAsync(async (req, res) => {
    const relms = await Relm.getAllRelms({ isPublic: true })
    respondWithSuccess(res, {
      action: "getPublicRelms",
      relms,
    })
  }),
)

relms.get(
  "/mine",
  cors(),
  middleware.authenticated(),
  middleware.authenticatedWithUser(),
  wrapAsync(async (req, res) => {
    const relms = await Relm.getDashboardRelms(req.authenticatedUserId)
    respondWithSuccess(res, {
      action: "getMyRelms",
      relms,
    })
  }),
)
