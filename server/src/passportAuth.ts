import * as express from 'express';
import passport from 'passport';
import { Strategy as PassportLocalStrategy } from "passport-local";
import { Strategy as PassportGoogleStrategy } from "passport-google-oauth2";

import { SocialConnection, User } from "./db/index.js";

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

passport.use(new PassportGoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/connect/google/callback",
  scope: ["email"]
}, async function(_, __, profile, done) {
  const { email, id : profileId } = profile;

  // Contrary to user/email, social logins will automatically create the account.
  // Get the user id of the user, or create one.
  let userId = await User.getUserIdByEmail({ email });
  if (userId === null) {
    return done(null, false);
  }

  // Register the connection.
  await SocialConnection.registerSocial({
    social: "google",
    userId,
    profileId
  });

  // Authentication was successful!
  done(null, userId);
}));

export default passportMiddleware;