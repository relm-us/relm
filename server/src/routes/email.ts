import express from "express";
import cors from "cors";
import { User } from "../db/index.js";
import { wrapAsync } from "../utils/index.js";

export const email = express.Router();

email.get(
  "/verify/:code",
  cors(),
  wrapAsync(async (req, res) => {
    const code = req.params.code;

    const confirmed = await User.markAsCompletedEmailVerification({ code });
    
    res.render("verifyAccount", {
      confirmed
    });
  })
);