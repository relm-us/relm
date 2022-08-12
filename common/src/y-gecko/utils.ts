import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";

import { encoding, decoding } from "lib0";

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;

const messageSync = 0;
const messageAwareness = 1;
// const messageAuth = 2

/**
 * @param {any} conn
 * @param {WSSharedDoc} doc
 * @param {Uint8Array} message
 */
const messageListener = async (conn, doc, message) => {
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
};

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 */
const closeConn = (doc, conn) => {
  if (doc.conns.has(conn)) {
    /**
     * @type {Set<number>}
     */
    // @ts-ignore
    const controlledIds = doc.conns.get(conn);
    doc.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null
    );
  }
  conn.close();
};

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 * @param {Uint8Array} m
 */
const send = (doc, conn, m) => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    closeConn(doc, conn);
  }
  try {
    conn.send(
      m,
      /** @param {any} err */ (err) => {
        err != null && closeConn(doc, conn);
      }
    );
  } catch (e) {
    closeConn(doc, conn);
  }
};