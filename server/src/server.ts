import fs from "fs";

import { ASSETS_DIR, DATABASE_NAME, PORT } from "./config";
import { server } from "./server_ws";
import { init } from "./db/db";

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

  server.listen(PORT, () => {
    console.log(`http/ws server listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
});
