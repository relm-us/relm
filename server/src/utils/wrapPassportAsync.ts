import passport from "passport";
import { respondWithError, respondWithFailure } from "./index.js";

/**
 * Used as a wrapper around passport.js to output failed authentication messages while 
 * ensuring async errors get caught and handled by our generic error handler.
 * The callback is called only if authentication was a success, otherwise a JSON error/failure message is sent.
 */
export function wrapAsyncPassport(strategy : string, fn) {
  return (req, res, next) => passport.authenticate(strategy, (error, socialId) => {
    if (error !== null) {
      return respondWithError(res, error);
    }

    // Check if credentials were valid.
    if (!socialId) {
      return respondWithFailure(res, "invalid credentials");
    }

    fn(req, res, next, socialId).catch(next);
  })(req, res, next);
}