import express from "express";
import cors from "cors";
import { User } from "../db/index.js";
import { wrapAsync, respondWithError, respondWithSuccess } from "../utils/index.js";

export const email = express.Router();

email.get(
  "/verify",
  cors(),
  wrapAsync(async (req, res) => {
    if (!req.query.code) {
      return respondWithError(res, "Missing verification code.");
    }
    const code = req.query.code;
    
    const completedVerification = await User.markAsCompletedEmailVerification({ code });
    if (completedVerification) {
      return respondWithSuccess(res, {});
    } else {
      return respondWithError(res, "No pending verification found with that code.");
    }

  })
);