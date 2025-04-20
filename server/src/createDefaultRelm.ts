import * as Y from "yjs";
import { importWorldDoc } from "relm-common";
import { getSyncedYDoc } from "./getSyncedYDoc.js";
import { Permission, Relm, useToken } from "./db/index.js";

export async function createDefaultRelm(participantId: string, content: any) {
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
}
