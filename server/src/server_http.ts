import express from "express";
import cors from "cors";

import * as middleware from "./middleware";
import * as routes from "./routes";
import { respond, uuidv4, wrapAsync } from "./utils";

export const app = express();

// Automatically parse JSON body when received in REST requests
app.use(express.json());

// Enable CORS pre-flight requests across the board
// See https://expressjs.com/en/resources/middleware/cors.html#enabling-cors-pre-flight
app.options("*", cors());

// Courtesy page just to say we're a Relm web server
app.get("/", function (_req, res) {
  res.send("Relm Server is OK");
});

app.use("/admin", routes.admin);
app.use("/asset", routes.asset);
app.use("/auth", routes.auth);
app.use("/relm/:relmName", middleware.relmName(), routes.relm);
app.use("/relms", routes.relms);
app.use("/screenshot", routes.screenshot);

// Error handling: catch-all for 404s
app.use((req, res) => {
  const code = 404;
  respond(res, code, {
    status: "error",
    code: code,
    reason: `Not found`,
  });
});

// Error handling: general catch-all for errors must be last middleware
// see http://expressjs.com/en/guide/error-handling.html
// see https://thecodebarbarian.com/80-20-guide-to-express-error-handling
app.use((error, req, res, next) => {
  const errorId = uuidv4().split("-")[0];
  const code = error.status || 400;
  console.log(
    `[${getRemoteIP(req)}] ${code} (${errorId}): ${error.message}\n${
      error.stack
    }`
  );
  respond(res, code, {
    status: "error",
    code: code,
    reason: `${error.message} (${errorId})`,
  });
});

// Used for logging IP addresses
function getRemoteIP(req) {
  return req.headers["x-forwarded-for"] || req.connection.remoteAddress;
}
