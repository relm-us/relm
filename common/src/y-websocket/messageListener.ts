import type { WSSharedDoc } from "./WSSharedDoc.js";

import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";

import { encoding, decoding } from "lib0";

import { send } from "./send.js";
import { messageSync, messageAwareness } from "./config.js";

/**
 * @param {any} conn
 * @param {WSSharedDoc} doc
 * @param {Uint8Array} message
 */
export async function messageListener(
  conn: any,
  doc: WSSharedDoc,
  message: Uint8Array
) {
  try {
    const encoder = encoding.createEncoder();
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);
    switch (messageType) {
      case messageSync:
        // await the doc state being updated from persistence, if available, otherwise
        // we may send sync step 2 too early
        if (doc.whenSynced) {
          await doc.whenSynced;
        }
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.readSyncMessage(decoder, encoder, doc, null);
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder));
        }
        break;
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          conn
        );
        break;
      }
    }
  } catch (err) {
    console.error(err);
    doc.emit("error", [err]);
  }
}
