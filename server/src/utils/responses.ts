import * as config from "../config";

export function respondWithError(res, reason) {
  console.error(reason);
  res.writeHead(200, config.CONTENT_TYPE_JSON);
  res.end(JSON.stringify({ status: "error", reason: reason }));
}

export function respondWithSuccess(res, json) {
  res.writeHead(200, config.CONTENT_TYPE_JSON);
  res.end(JSON.stringify({ status: "success", ...json }));
}
