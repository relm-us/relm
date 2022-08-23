import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import { mutex, encoding, decoding } from "lib0";
import debounce from "lodash.debounce";
import WebSocket from "ws";

import { YGARBAGE_COLLECTION } from "../config.js";
import { defaultCallbackHandler, isDefaultCallbackSet } from "./callback.js";
import { getPersistence, getWSYDoc, removeWSYDocFromCache } from "../utils/index.js";

const CALLBACK_DEBOUNCE_WAIT =
  parseInt(process.env.CALLBACK_DEBOUNCE_WAIT) || 2000;
const CALLBACK_DEBOUNCE_MAXWAIT =
  parseInt(process.env.CALLBACK_DEBOUNCE_MAXWAIT) || 10000;

const messageSync = 0;
const messageAwareness = 1;

const OPEN_WEBSOCKET_STATE = 1;

const pingTimeout = 30000;


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
  doc.conns.forEach((_, conn) => send(doc, conn, message));
};

const send = (doc: WSSharedDoc, conn: WebSocket, message: Uint8Array) => {
  if (conn.readyState === OPEN_WEBSOCKET_STATE) {
    try {
      conn.send(message);
    } catch (error) {
      closeConn(doc, conn);
    }
  } else {
    closeConn(doc, conn);
  }
};

const closeConn = (doc: WSSharedDoc, conn: WebSocket) => {
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
    
    const persistence = getPersistence();
    if (doc.conns.size === 0 && persistence !== null) {
      if (doc.isSynced) {
        doc.destroy();
      }
      removeWSYDocFromCache(doc.name);
    }
  }
  conn.close();
};

const messageListener = async (conn: WebSocket, doc: WSSharedDoc, message: Uint8Array) => {
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

export const handler = async (conn: WebSocket, { docName, gc = true, callbackHandler = null } : { docName: string, gc?: boolean, callbackHandler?: any }) => {
  conn.binaryType = "arraybuffer";
  // get doc, initialize if it does not exist yet
  const doc = await getWSYDoc(docName, { gc, callbackHandler });
  doc.conns.set(conn, new Set());
  // listen and reply to events
  conn.on("message", message => messageListener(conn, doc, new Uint8Array(message as ArrayBufferLike)));

  // Check if connection is still alive
  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        closeConn(doc, conn);
      }6
      clearInterval(pingInterval);
    } else if (doc.conns.has(conn)) {
      pongReceived = false;
      try {
        conn.ping();
      } catch (e) {
        closeConn(doc, conn);
        clearInterval(pingInterval);
      }
    }
  }, pingTimeout);
  conn.on("close", () => {
    closeConn(doc, conn);
    clearInterval(pingInterval);
  });
  conn.on("pong", () => {
    pongReceived = true;
  });
  // put the following in a variables in a block so the interval handlers don't keep in in
  // scope
  {
    // await the doc state being updated from persistence, if available, otherwise
    // we may send sync step 1 too early
    if (doc.whenSynced) {
      await doc.whenSynced;
    }

    // send sync step 1
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    send(doc, conn, encoding.toUint8Array(encoder));
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
      send(doc, conn, encoding.toUint8Array(encoder));
    }
  }
};

export class WSSharedDoc extends Y.Doc {
  name: string;
  mux: any;
  conns: Map<WebSocket, Set<number>>;
  awareness: awarenessProtocol.Awareness;
  whenSynced: Promise<void>;
  isSynced: boolean;

  /**
   * @param {string} name
   */
  constructor(
    name,
    { callbackHandler = isDefaultCallbackSet ? defaultCallbackHandler : null, persistence } : { callbackHandler: any, persistence? }
  ) {
    super({ gc: YGARBAGE_COLLECTION });
    this.name = name;
    this.mux = mutex.createMutex();
    /**
     * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
     * @type {Map<WebSocket, Set<number>>}
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
      this.conns.forEach((_, socket) => send(this, socket, buff));
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

    if (persistence !== null) {
      this.whenSynced = persistence.bindState(name, this).then(() => {
        this.isSynced = true;
      });
    }
  }
}