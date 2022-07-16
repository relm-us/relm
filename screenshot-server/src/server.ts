import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

import { respondWithError } from "./utils/index.js";
import * as routes from "./routes/index.js";

import { SCREENSHOT_API_PORT } from "./config.js";

const app = express();

// Enable CORS pre-flight requests across the board
// See https://expressjs.com/en/resources/middleware/cors.html#enabling-cors-pre-flight
app.options("*", cors());

// Courtesy page just to say we're a Relm screenshot server
app.get("/", function (_req, res) {
  res.send("Relm Screenshot Server is OK");
});

// routes
app.use("/screenshot", routes.screenshot);

// Error handling: catch-all for 404s
app.use((_, res) => {
  respondWithError(res, `Not found`);
});

// Error handling: general catch-all for errors must be last middleware
// see http://expressjs.com/en/guide/error-handling.html
// see https://thecodebarbarian.com/80-20-guide-to-express-error-handling
app.use((error, req, res, next) => {
  const errorId = uuidv4().split("-")[0];
  const code = error.status || 400;
  console.warn(
    `[${getRemoteIP(req)}] ${req.originalUrl} ${code} (${errorId}): ${
      error.message
    }\n${error.stack}`
  );
  respondWithError(res, `${error.message} (${errorId})`);
});

// Used for logging IP addresses
function getRemoteIP(req) {
  return req.headers["x-forwarded-for"] || req.connection.remoteAddress;
}

app.listen(SCREENSHOT_API_PORT, () => {
  console.log(`screenshot server listening on ${SCREENSHOT_API_PORT}`);
});