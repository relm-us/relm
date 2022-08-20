import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import { encoding, decoding, mutex } from "lib0";
import { ServerChannel } from "@geckos.io/server";
import debounce from "lodash.debounce";

import { ydocStats } from "../ydocStats.js";
import { YGARBAGE_COLLECTION } from "../config.js";
import { defaultCallbackHandler, isDefaultCallbackSet } from "./callback.js";
import { getGeckoYDoc } from "../utils/yDoc.js";

const CALLBACK_DEBOUNCE_WAIT =
  parseInt(process.env.CALLBACK_DEBOUNCE_WAIT) || 2000;
const CALLBACK_DEBOUNCE_MAXWAIT =
  parseInt(process.env.CALLBACK_DEBOUNCE_MAXWAIT) || 10000;

const messageSync = 0;
const messageAwareness = 1;

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
 const updateHandler = (update, origin, doc) => {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeUpdate(encoder, update);
  const message = encoding.toUint8Array(encoder);
  doc.conns.forEach((_, conn) => {
    conn.raw.send(message);
  });
};

async function onMessage(channel: ServerChannel, doc: GeckoSharedDoc, message: Uint8Array) {
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
          channel.raw.emit(encoding.toUint8Array(encoder));
        }
        break;
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          channel
        );
        break;
      }
    }
  } catch (err) {
    console.error(err);
    doc.emit("error", [err]);
  }
}

export const handler = async channel => {
  const doc = await getGeckoYDoc(channel.userData.docId, { callbackHandler: ydocStats });
  doc.conns.set(channel, new Set());

  channel.onRaw(buffer => {
    const message = new Uint8Array(buffer as Buffer);
    onMessage(channel, doc, new Uint8Array(message));
  });

  channel.onDisconnect(() => {
    const controlledIds = doc.conns.get(channel);
    doc.conns.delete(channel);

    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null
    );
  });

  if (doc.whenSynced) {
    await doc.whenSynced;
  }

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  channel.raw.emit(encoding.toUint8Array(encoder));
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    channel.raw.emit(encoding.toUint8Array(encoder));
  }
};

export class GeckoSharedDoc extends Y.Doc {
  name: string;
  mux: any;
  conns: Map<ServerChannel, Set<number>>;
  awareness: any;
  whenSynced: Promise<void>;
  isSynced: boolean;

  /**
   * @param {string} name
   */
  constructor(
    name,
    { callbackHandler = isDefaultCallbackSet ? defaultCallbackHandler : null } : { callbackHandler: any }
  ) {
    super({ gc: YGARBAGE_COLLECTION });
    this.name = name;
    this.mux = mutex.createMutex();
    /**
     * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
     * @type {Map<ServerChannel, Set<number>>}
     */
    this.conns = new Map();
    /**
     * @type {awarenessProtocol.Awareness}
     */
    this.awareness = new awarenessProtocol.Awareness(this);
    this.awareness.setLocalState(null);
    /**
     * @type {Promise<void>|void}
     */
    this.whenSynced = void 0;
    /**
     * @type {boolean}
     */
    this.isSynced = false;
    /**
     * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
     * @param {Object | null} conn Origin is the connection that made the change
     */
    const awarenessChangeHandler = ({ added, updated, removed }, conn) => {
      const changedClients = added.concat(updated, removed);
      if (conn !== null) {
        const connControlledIDs =
          /** @type {Set<number>} */ this.conns.get(conn);
        if (connControlledIDs !== undefined) {
          added.forEach((clientID) => {
            connControlledIDs.add(clientID);
          });
          removed.forEach((clientID) => {
            connControlledIDs.delete(clientID);
          });
        }
      }
      // broadcast awareness update
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      );
      const buff = encoding.toUint8Array(encoder);
      this.conns.forEach((_, c) => {
        c.raw.emit(buff);
      });
    };
    this.awareness.on("update", awarenessChangeHandler);
    this.on("update", updateHandler);

    if (callbackHandler) {
      this.on(
        "update",
        debounce(callbackHandler, CALLBACK_DEBOUNCE_WAIT, {
          maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
        })
      );
    }
  }
}