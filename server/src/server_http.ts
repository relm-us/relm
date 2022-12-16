import express from "express";
import session from "express-session";
import MemoryStoreConstructor from "memorystore";
import cors from "cors";
import * as middleware from "./middleware.js";
import * as routes from "./routes/index.js";
import passportMiddleware from "./passportAuth.js";
import { respondWithError, respondWithFailure, uuidv4 } from "./utils/index.js";

export const app = express();

const MemoryStore = MemoryStoreConstructor(session);

// Automatically parse JSON body when received in REST requests
app.use(express.json());

app.use(
  session({
    // At the moment, specifying a specific secret is not necessary as we only use
    // this to temp store oauth data for services that don't use OAuth2
    secret: uuidv4(),
    saveUninitialized: false,
    resave: false,
    store: new MemoryStore({
      // every hour check for expired sessions and get rid of them from memory
      checkPeriod: 60000 * 60,
    }),
    cookie: {
      // 30 minutes as we only use this to store oauth data between clicking the
      // sign in button, to after the oauth process
      maxAge: 60000 * 30,
    },
    name: "session",
  })
);

// Enable CORS pre-flight requests across the board
// See https://expressjs.com/en/resources/middleware/cors.html#enabling-cors-pre-flight
app.options("*", cors());

app.use(passportMiddleware);

// Courtesy page just to say we're a Relm web server
app.get("/", function (_req, res) {
  res.send("Relm Server is OK");
});

app.use("/admin", routes.admin);
app.use("/asset", routes.asset);
app.use("/auth", routes.auth);
app.use("/invite", middleware.relmName(), routes.invite);
app.use("/relm", middleware.relmName(), routes.relm);
app.use("/relms", routes.relms);

// Error handling: catch-all for 404s
app.use((req, res) => {
  respondWithError(res, `Not found: ${req.originalUrl}`);
});

// Error handling: general catch-all for errors must be last middleware
// see http://expressjs.com/en/guide/error-handling.html
// see https://thecodebarbarian.com/80-20-guide-to-express-error-handling
app.use((error, req, res, next) => {
  const errorId = uuidv4().split("-")[0];
  const code = error.status || 400;

  let message = error.message;

  // Special case for QueryResultError, show the SQL source of the error
  if (error.query) message += "\n  Query: " + error.query.text;

  console.warn(
    `[${getRemoteIP(req)}] ${
      req.originalUrl
    } ${code} (${errorId}): ${message}\n${error.stack}`
  );
  respondWithFailure(res, `${error.message} (${errorId})`);
});

// Used for logging IP addresses
function getRemoteIP(req) {
  return req.headers["x-forwarded-for"] || req.connection.remoteAddress;
}
