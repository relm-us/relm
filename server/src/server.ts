import fs from "node:fs";

import { config } from "./config.js";
import { server } from "./server_ws.js";
import { init } from "./db/db.js";

if (!fs.existsSync(config.ASSETS_DIR)) {
	throw Error(`Asset upload directory doesn't exist: ${config.ASSETS_DIR}`);
}

async function start() {
	try {
		await init();
	} catch (err) {
		console.error(err);
		throw Error("Unable to connect to database");
	}
	console.log(`Connected to database '${config.DATABASE_NAME}'`);

	server.listen(config.PORT, () => {
		console.log(`http/ws server listening on ${config.PORT}`);
	});
}

start().catch((err) => {
	console.error(err);
});
