const fs = require("fs");

const server = require("./server_ws.js");
const db = require("./db/db.js");
const config = require("./config.js");

if (!fs.existsSync(config.ASSETS_DIR)) {
  throw Error(`Asset upload directory doesn't exist: ${config.ASSETS_DIR}`);
}

async function start() {
  try {
    await db.init();
  } catch (err) {
    console.error(err);
    throw Error("Unable to connect to database");
  }
  console.log(`Connected to database '${config.DATABASE_NAME}'`);

  const port = config.PORT;
  server.listen(port, () => {
    console.log(`http/ws server listening on ${port}`);
  });
}

start().catch((err) => {
  console.error(err);
});
