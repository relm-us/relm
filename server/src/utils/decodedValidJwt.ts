import * as crypto from "crypto";

export function decodedValidJwt(
  jwt: string,
  secretkey: string,
  validTimeSec: number = 60
): any | null {
  const jwtHeader = jwt.split(".")[0];
  const jwtPayload = jwt.split(".")[1];
  const jwtSignature = jwt.split(".")[2];
  const signature = crypto
    .createHmac("RSA-SHA256", secretkey)
    .update(jwtHeader + "." + jwtPayload)
    .digest("base64");
  var isValid =
    jwtSignature ==
    signature.replace(/\+/g, "-").replace(/=/g, "").replace(/\//g, "_");
  var decoded;
  try {
    decoded = JSON.parse(Buffer.from(jwtPayload, "base64").toString("utf8"));
  } catch (e) {
    return null;
  }
  if (Math.abs(decoded.iat - new Date().getTime() / 1000) > validTimeSec) {
    isValid = false; // check jwt "issued at" time is less than 1 minute (or as specified)
  }
  if (isValid) {
    return decoded;
  } else {
    return null;
  }
}
