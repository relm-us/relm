import passport from "passport";

export enum PassportResponse {
  // Successfully retrieved social id
  SUCCESS,
  // Internal server error
  ERROR,
  // Purposeful server error (e.g. failed authentication)
  FAILURE,
  // User does not exist
  NO_USER_FOUND
}

/**
 * Used as a wrapper around passport.js to handle trying authentication and returning relevant data
 */
export function wrapAsyncPassport(strategy : string, fn : (req, res, next, type : PassportResponse, data?) => Promise<void>) {
  return (req, res, next) => passport.authenticate(strategy, (errorData, socialId) => {
    if (errorData !== null) {
      return fn(req, res, next, errorData.isError ? PassportResponse.ERROR : PassportResponse.FAILURE, errorData);
    }

    // Check if credentials were valid.
    if (!socialId) {
      return fn(req, res, next, PassportResponse.NO_USER_FOUND);
    }

    fn(req, res, next, PassportResponse.SUCCESS, socialId).catch(next);
  })(req, res, next);
}