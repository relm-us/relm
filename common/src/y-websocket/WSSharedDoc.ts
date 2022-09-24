import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import * as syncProtocol from "y-protocols/sync";
import { encoding, mutex } from "lib0";
import debounce from "lodash.debounce";

import { getPersistence } from "./persistence.js";
import { send } from "./send.js";
import {
  CALLBACK_DEBOUNCE_MAXWAIT,
  CALLBACK_DEBOUNCE_WAIT,
  GC_ENABLED,
  messageAwareness,
  messageSync,
} from "./config.js";

export class WSSharedDoc extends Y.Doc {
  name: string;
  mux: any;
  conns: Map<Object, Set<number>>;
  awareness: any;
  whenSynced: Promise<void>;
  isSynced: boolean;

  /**
   * @param {string} name
   */
  constructor(name, { callbackHandler = null }) {
    super({ gc: GC_ENABLED });
    this.name = name;
    this.mux = mutex.createMutex();
    /**
     * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
     * @type {Map<Object, Set<number>>}
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
        send(this, c, buff);
      });
    };
    this.awareness.on("update", awarenessChangeHandler);

    this.on("update", (update: Uint8Array, origin: any, doc: WSSharedDoc) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      doc.conns.forEach((_, conn) => send(doc, conn, message));
    });

    if (callbackHandler) {
      this.on(
        "update",
        debounce(callbackHandler, CALLBACK_DEBOUNCE_WAIT, {
          maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
        })
      );
    }

    const persistence = getPersistence();

    if (persistence !== null) {
      this.whenSynced = persistence.bindState(name, this).then(() => {
        this.isSynced = true;
      });
    }
  }
}
