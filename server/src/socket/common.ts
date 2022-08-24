import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import * as syncProtocol from "y-protocols/sync";
import { encoding, decoding, mutex } from "lib0";
import http from "http";
import { CALLBACK_URL, CALLBACK_OBJECTS, CALLBACK_TIMEOUT, YGARBAGE_COLLECTION, CALLBACK_DEBOUNCE_WAIT, CALLBACK_DEBOUNCE_MAXWAIT } from "../config.js";
import debounce from "lodash.debounce";

export const isDefaultCallbackSet = !!CALLBACK_URL;

export const messageSync = 0;
export const messageAwareness = 1;

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
export const defaultCallbackHandler = (update, origin, doc) => {
  const room = doc.name;
  const dataToSend = {
    room: room,
    data: {},
  };
  const sharedObjectList = Object.keys(CALLBACK_OBJECTS);
  sharedObjectList.forEach((sharedObjectName) => {
    const sharedObjectType = CALLBACK_OBJECTS[sharedObjectName];
    dataToSend.data[sharedObjectName] = {
      type: sharedObjectType,
      content: getContent(sharedObjectName, sharedObjectType, doc).toJSON(),
    };
  });
  callbackRequest(CALLBACK_URL, CALLBACK_TIMEOUT, dataToSend);
};

/**
 * @param {URL} url
 * @param {number} timeout
 * @param {Object} data
 */
export const callbackRequest = (url, timeout, data) => {
  data = JSON.stringify(data);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    timeout: timeout,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };
  const req = http.request(options);
  req.on("timeout", () => {
    console.warn("Callback request timed out.");
    req.abort();
  });
  req.on("error", (e) => {
    console.error("Callback request error.", e);
    req.abort();
  });
  req.write(data);
  req.end();
};

/**
 * @param {string} objName
 * @param {string} objType
 * @param {WSSharedDoc} doc
 */
export const getContent = (objName, objType, doc) => {
  switch (objType) {
    case "Array":
      return doc.getArray(objName);
    case "Map":
      return doc.getMap(objName);
    case "Text":
      return doc.getText(objName);
    case "XmlFragment":
      return doc.getXmlFragment(objName);
    case "XmlElement":
      return doc.getXmlElement(objName);
    default:
      return {};
  }
};

export abstract class ProviderSharedDoc<T> extends Y.Doc {
  name: string;
  mux: any;
  conns: Map<T, Set<number>>;
  awareness: awarenessProtocol.Awareness;
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
     */
    this.conns = new Map();
    this.awareness = new awarenessProtocol.Awareness(this);
    this.awareness.setLocalState(null);
    /**
     * @type {Promise<void>|void}
     */
    this.whenSynced = void 0;
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
      this.conns.forEach((_, c) => this.send(c, buff));
    };
    this.awareness.on("update", awarenessChangeHandler);
    this.on("update", (update, o) => this.updateHandler(update, o));

    if (callbackHandler) {
      this.on(
        "update",
        debounce(callbackHandler, CALLBACK_DEBOUNCE_WAIT, {
          maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
        })
      );
    }
  }

  async handlePacket(conn: T, message: Uint8Array) {
    try {
      const encoder = encoding.createEncoder();
      const decoder = decoding.createDecoder(message);
      const messageType = decoding.readVarUint(decoder);
      switch (messageType) {
        case messageSync:
          // await the doc state being updated from persistence, if available, otherwise
          // we may send sync step 2 too early
          if (this.whenSynced) {
            await this.whenSynced;
          }
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.readSyncMessage(decoder, encoder, this, null);
          if (encoding.length(encoder) > 1) {
            this.send(conn, encoding.toUint8Array(encoder));
          }
          break;
        case messageAwareness: {
          awarenessProtocol.applyAwarenessUpdate(
            this.awareness,
            decoding.readVarUint8Array(decoder),
            conn
          );
          break;
        }
      }
    } catch (err) {
      console.error(err);
      this.emit("error", [err]);
    }
  }

  updateHandler(update: Uint8Array, _) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);
    this.conns.forEach((_, conn) => this.send(conn, message));
  }

  abstract send(conn: T, buffer: Uint8Array);
}