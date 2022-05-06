import * as config from "../config.js";

export function respondWithError(res, reason, details = undefined) {
  console.error(reason);
  res.writeHead(200, config.CONTENT_TYPE_JSON);
  res.end(JSON.stringify({ status: "error", reason, details }));
}

export function respondWithSuccess(res, json) {
  res.writeHead(200, config.CONTENT_TYPE_JSON);
  res.end(JSON.stringify({ status: "success", ...json }));
}
