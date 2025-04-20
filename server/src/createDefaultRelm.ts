import type * as Y from "yjs";
import { importWorldDoc } from "relm-common";
import { getSyncedYDoc } from "./getSyncedYDoc.js";
import { Relm } from "./db/index.js";

const delay = (ms) => new Promise((done) => setTimeout(done, ms));

export async function createDefaultRelm(content: any) {
	// Anonymous users can visit the default relm
	const newRelm = await Relm.createRelm({
		relmName: "default",
		publicPermissions: ["read", "access"],
	});

	if (!newRelm) {
		throw new Error("unable to create default relm");
	}

	const newRelmDoc: Y.Doc = await getSyncedYDoc(newRelm.permanentDocId);

	importWorldDoc(content, newRelmDoc);

	await delay(2000);
}
