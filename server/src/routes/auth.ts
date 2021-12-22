import * as express from "express";
import cors from "cors";
import { wrapAsync, respond } from "../utils";
import * as middleware from "../middleware";

export const auth = express.Router();

// TODO: Remove this, as it doesn't seem to be used?
auth.post(
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
