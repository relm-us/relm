import * as express from 'express';
import passport from 'passport';
import { Strategy as PassportLocalStrategy } from "passport-local";

import { User } from "./db/index.js";

const passportMiddleware = express.Router();
passportMiddleware.use(passport.initialize());

passport.use(new PassportLocalStrategy({
  usernameField: "email",
  passwordField: "password"
}, async function(email, password, done) {

  // Check if user credentials are valid.
  const validCredentials = await User.verifyCredentials({ email, password });
  if (!validCredentials) {
    return done(null, false);
  }

  // Get user id and pass it along.
  const userId = await User.getUserIdByEmail({ email });
  if (userId === null) {
    return done("Unable to find userId of email after local authentication.");
  }

  // Authentication was successful!
  done(null, userId);
}));

export default passportMiddleware;