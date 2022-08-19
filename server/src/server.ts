import fs from "fs";

import { ASSETS_DIR, DATABASE_NAME, PORT } from "./config.js";
import { server } from "./server_ws.js";
import { geckoServer } from "./server_gecko.js";
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

  geckoServer.addServer(server);

  server.listen(PORT, () => {
    console.log(`http/ws/gecko server listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
});
