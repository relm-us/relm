import * as config from "../config";

export function fail(res, reason) {
  console.error(reason);
  res.writeHead(500, config.CONTENT_TYPE_JSON);
  res.end(
    JSON.stringify({
      status: "error",
      reason: reason,
    })
  );
}

export function respond(res, code, json) {
  res.writeHead(code, config.CONTENT_TYPE_JSON);
  res.end(
    JSON.stringify(
      Object.assign(
        {
          status: code === 200 ? "success" : "failure",
        },
        json
      )
    )
  );
}
