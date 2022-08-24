import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import { encoding } from "lib0";
import WebSocket from "ws";

import { defaultCallbackHandler, isDefaultCallbackSet, ProviderSharedDoc, messageAwareness, messageSync } from "./common.js";
import { getPersistence, getWSYDoc, removeWSYDocFromCache } from "../utils/index.js";

const OPEN_WEBSOCKET_STATE = 1;

const pingTimeout = 30000;

export const handler = async (conn: WebSocket, { docName, gc = true, callbackHandler = null } : { docName: string, gc?: boolean, callbackHandler?: any }) => {
  conn.binaryType = "arraybuffer";
  // get doc, initialize if it does not exist yet
  const doc = await getWSYDoc(docName, { gc, callbackHandler });
  doc.conns.set(conn, new Set());
  // listen and reply to events
  conn.on("message", message => doc.handlePacket(conn, new Uint8Array(message as ArrayBufferLike)));

  // Check if connection is still alive
  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        doc.closeConn(conn);
      }
      clearInterval(pingInterval);
    } else if (doc.conns.has(conn)) {
      pongReceived = false;
      try {
        conn.ping();
      } catch (e) {
        doc.closeConn(conn);
        clearInterval(pingInterval);
      }
    }
  }, pingTimeout);
  conn.on("close", () => {
    doc.closeConn(conn);
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
    doc.send(conn, encoding.toUint8Array(encoder));
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
      doc.send(conn, encoding.toUint8Array(encoder));
    }
  }
};

export class WSSharedDoc extends ProviderSharedDoc<WebSocket> {

  constructor(
    name,
    { callbackHandler = isDefaultCallbackSet ? defaultCallbackHandler : null, persistence } : { callbackHandler: any, persistence? }
  ) {
    super(name, { callbackHandler });

    if (persistence !== null) {
      this.whenSynced = persistence.bindState(name, this).then(() => {
        this.isSynced = true;
      });
    }
  }

  send(conn: WebSocket, buffer: Uint8Array) {
    if (conn.readyState === OPEN_WEBSOCKET_STATE) {
      try {
        conn.send(buffer);
      } catch (error) {
        this.closeConn(conn);
      }
    } else {
      this.closeConn(conn);
    }
  }

  closeConn(conn: WebSocket) {
    if (this.conns.has(conn)) {
      /**
       * @type {Set<number>}
       */
      // @ts-ignore
      const controlledIds = this.conns.get(conn);
      this.conns.delete(conn);
      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        Array.from(controlledIds),
        null
      );
      
      const persistence = getPersistence();
      if (this.conns.size === 0 && persistence !== null) {
        if (this.isSynced) {
          this.destroy();
        }
        removeWSYDocFromCache(this.name);
      }
    }
    conn.close();
  }
}