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
    
    const completedVerification = await User.markAsCompletedEmailVerification({ code });

    if (completedVerification) {
      res.render("verifyAccount", {
        status: "success"
      });
    } else {
      res.render("verifyAccount", {
        status: "error",
        reason: "No account verification could be found with the provided code."
      });
    }

  })
);