import fs from "fs";
import http from "http";

import { ASSETS_DIR, DATABASE_NAME, PORT } from "./config.js";
import { geckoServer } from "./server_ws.js";
import { app as expressApp } from "./server_http.js";
import { init } from "./db/db.js";

if (!fs.existsSync(ASSETS_DIR)) {
  throw Error(`Asset upload directory doesn't exist: ${ASSETS_DIR}`);
}

async function start() {
  try {
    await init();
  } catch (err) {
    console.error(err);
    throw Error("Unable to connect to database");
  }
  console.log(`Connected to database '${DATABASE_NAME}'`);

  // Start gecko server and run http server using same port
  const server = http.createServer({}, expressApp);
  geckoServer.addServer(server);

  server.listen(PORT, () => {
    console.log(`http/gecko server listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
});
