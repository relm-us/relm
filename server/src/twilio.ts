import { jwt } from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
} from "./config";

// Max. period that a Participant is allowed to be in a Room (currently 14400 seconds or 4 hours)
const MAX_ALLOWED_SESSION_DURATION = 14400;

export type Identity = string;

export function getToken(identity: string) {
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created.
  const token = new jwt.AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_SECRET,
    { ttl: MAX_ALLOWED_SESSION_DURATION }
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  const grant = new jwt.AccessToken.VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string.
  return token.toJwt();
}
