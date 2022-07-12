import * as express from 'express';
import passport from 'passport';
import { Strategy as PassportLocalStrategy } from "passport-local";
import { Strategy as PassportGoogleStrategy } from "passport-google-oauth2";
import { Strategy as PassportLinkedinStrategy } from "passport-linkedin-oauth2";
import { Strategy as PassportFacebookStrategy } from "passport-facebook";
import { Strategy as PassportTwitterStrategy } from "passport-twitter-oauth2";

import { Participant, SocialConnection, User } from "./db/index.js";

const passportMiddleware = express.Router();
passportMiddleware.use(passport.initialize());

// Wraps async passport functions to allow proper async error handling
const wrapPassportSync = fn => ((...args) => {
  const done = args[args.length - 1];
  fn.apply(null, args).catch(done);
});

// Ensure all the variable names in the array exist in the process.env object.
const ensureEnvVarsExist = (variables = []) => {
  return !variables.some(v => !process.env[v]);
}

/*
  These passport strategies have the following goal.
    - Authenticate details of the user
*/

// Username/password OAuth
passport.use(new PassportLocalStrategy({
  usernameField: "email",
  passwordField: "password",
}, wrapPassportSync(async function(email, password, done) {
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
})));

// OAuth handler to handle OAuth callback
async function handleOAuthPassport(socialId, req, email, profileId, done) {
  const participantId = req.authenticatedParticipantId;

  // First check if the participant has an existing user id.
  const existingParticipantUserId = await Participant.getUserId({ participantId });

  // If the social is connected, find the user id associated with it.
  let connectedSocialUserId = await SocialConnection.getUserIdBySocial({
    social: socialId,
    profileId
  });
  if (connectedSocialUserId === null) {
    // Try and create the user.
    if (existingParticipantUserId !== null) {
      // Use the existing social connection as long as 
      // the social has not already been linked with another account.
      const existingSocialConnectionProfileId = await SocialConnection.getProfileIdBySocial({
        social: socialId,
        userId: existingParticipantUserId
      });

      if (existingSocialConnectionProfileId !== null && existingSocialConnectionProfileId !== profileId) {
        return done("This participant is already linked with another social account.");
      }

      connectedSocialUserId = existingParticipantUserId;
    } else {
      // The participant is not linked to any user.
      // The social we are trying to use is not linked to any account either.
      // Try searching for an user id using the email, otherwise create an account.
      const existingEmailUserId = await User.getUserIdByEmail({ email });
      if (existingEmailUserId !== null) {
        connectedSocialUserId = existingEmailUserId;
      } else {
        connectedSocialUserId = await User.createUser({ email });
      }
    }

    // Now that we are guaranteed a user id,
    // register the connection!
    await SocialConnection.registerSocial({
      social: socialId,
      profileId,
      userId: connectedSocialUserId
    });
  } else {
    // The social used is associated with a user and a connection exists.
    
    if (existingParticipantUserId !== null && existingParticipantUserId !== connectedSocialUserId) {
      return done("This participant is already linked with another social account.");
    }
  }

  // Authentication was successful!
  done(null, connectedSocialUserId);
}

// Google OAuth
if (ensureEnvVarsExist(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"])) {
  passport.use(new PassportGoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/connect/google/callback",
    scope: ["email"],
    passReqToCallback: true
  }, (req, _, __, profile, done) => handleOAuthPassport("google", req, profile.email, profile.id, done).catch(done)));
}

// Linkedin
if (ensureEnvVarsExist(["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"])) {
  passport.use(new PassportLinkedinStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "/auth/connect/linkedin/callback",
    scope: ["r_emailaddress", "r_liteprofile"],
    passReqToCallback: true
  }, (req, _, __, profile, done) => handleOAuthPassport("linkedin", req, profile.emails[0], profile.id, done).catch(done)));
}

// Facebook
if (ensureEnvVarsExist(["FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET"])) {
  passport.use(new PassportFacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "/auth/connect/facebook/callback",
    profileFields: ["id", "email"],
    passReqToCallback: true
  }, (req, _, __, profile, done) => {
    if (!profile.emails) {
      return done("Missing emails in oAuth data.");
    }
    handleOAuthPassport("facebook", req, profile.emails[0], profile.id, done).catch(done);
  }));
}

if (ensureEnvVarsExist(["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"])) {
  passport.use(new PassportTwitterStrategy({
    clientID: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackURL: "/auth/connect/twitter/callback",
    includeEmail: true,
    passReqToCallback: true
  }, (req, _, __, profile, done) => {
    if (!profile.emails) {
      return done("Missing emails in oAuth data.");
    }
    handleOAuthPassport("twitter", req, profile.emails[0], profile.id, done).catch(done);
  }));
}

export default passportMiddleware;