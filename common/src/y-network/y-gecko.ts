/**
 * @module provider/websocket
 */

/* eslint-env browser */

import * as Y from "yjs"; // eslint-disable-line
import * as bc from "lib0/broadcastchannel";
import * as time from "lib0/time";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import { Observable } from "lib0/observable";
import * as math from "lib0/math";
import gecko, { ClientChannel } from "@geckos.io/client";
import { MessageHandler, MESSAGE_AWARENESS_ID, MESSAGE_QUERY_AWARENESS_ID, MESSAGE_SYNC_ID, messageHandlers } from "./handlers.js";

const reconnectTimeoutBase = 1200;
const maxReconnectTimeout = 2500;
// @todo - this should depend on awareness.outdatedTime
const messageReconnectTimeout = 30000;

/**
 * @param {GeckoProvider} provider
 * @param {Uint8Array} buf
 * @param {boolean} emitSynced
 * @return {encoding.Encoder}
 */
const readMessage = (provider, buf, emitSynced) => {
  const decoder = decoding.createDecoder(buf);
  const encoder = encoding.createEncoder();
  const messageType = decoding.readVarUint(decoder);
  const messageHandler = provider.messageHandlers[messageType];
  if (/** @type {any} */ messageHandler) {
    messageHandler(encoder, decoder, provider, emitSynced, messageType);
  } else {
    console.error("Unable to compute message");
  }
  return encoder;
};

/**
 * @param {GeckoProvider} provider
 */
const setupGecko = (provider, authorization) => {
  if (provider.shouldConnect && provider.gecko === null) {
    const geckoClient = gecko({
      url: provider.url,
      port: null,
      authorization
    });

    provider.gecko = geckoClient;
    provider.geckoConnecting = true;
    provider.geckoConnected = false;
    provider.synced = false;

    geckoClient.onRaw(event => {
      const message = new Uint8Array(event as ArrayBuffer);
      provider.geckoLastMessageReceived = time.getUnixTime();
      
      const encoder = readMessage(provider, message, true);
      if (encoding.length(encoder) > 1) {
        geckoClient.raw.emit(encoding.toUint8Array(encoder));
      }
    });

    geckoClient.onDisconnect(error => {
      console.error("y-gecko was disconnected for:", error);
      provider.gecko = null;
      provider.geckoConnecting = false;
      if (provider.geckoConnected) {
        provider.geckoConnected = false;
        provider.synced = false;
        // update awareness (all users except local left)
        awarenessProtocol.removeAwarenessStates(
          provider.awareness,
          Array.from(provider.awareness.getStates().keys() as number[]).filter(
            (client) => client !== provider.doc.clientID
          ),
          provider
        );
        provider.emit("status", [
          {
            status: "disconnected",
          },
        ]);
      } else {
        provider.geckoUnsuccessfulReconnects++;
      }

      // Start with no reconnect timeout and increase timeout by
      // log10(wsUnsuccessfulReconnects).
      // The idea is to increase reconnect timeout slowly and have no reconnect
      // timeout at the beginning (log(1) = 0)
      setTimeout(
        setupGecko,
        math.min(
          math.log10(provider.geckoUnsuccessfulReconnects + 1) *
            reconnectTimeoutBase,
          maxReconnectTimeout
        ),
        provider,
        authorization
      );
    });

    geckoClient.onConnect(() => {
      provider.geckoLastMessageReceived = time.getUnixTime();
      provider.geckoConnecting = false;
      provider.geckoConnected = true;
      provider.geckoUnsuccessfulReconnects = 0;
      provider.emit("status", [
        {
          status: "connected",
        },
      ]);
      // always send sync step 1 when connected
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC_ID);
      syncProtocol.writeSyncStep1(encoder, provider.doc);
      geckoClient.raw.emit(encoding.toUint8Array(encoder));
      // broadcast local awareness state
      if (provider.awareness.getLocalState() !== null) {
        const encoderAwarenessState = encoding.createEncoder();
        encoding.writeVarUint(encoderAwarenessState, MESSAGE_AWARENESS_ID);
        encoding.writeVarUint8Array(
          encoderAwarenessState,
          awarenessProtocol.encodeAwarenessUpdate(provider.awareness, [
            provider.doc.clientID,
          ])
        );
        geckoClient.raw.emit(encoding.toUint8Array(encoderAwarenessState));
      }
    });

    provider.emit("status", [
      {
        status: "connecting",
      },
    ]);
  }
};

const broadcastMessage = (provider: GeckoProvider, buf) => {
  if (provider.geckoConnected) {
    provider.gecko.raw.emit(buf);
  }
  if (provider.bcConnected) {
    bc.publish(provider.bcChannel, buf, provider);
  }
};

/**
 * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
 * The document name is attached to the provided url. I.e. the following example
 * creates a websocket connection to http://localhost:1234/my-document-name
 *
 * @example
 *   import * as Y from 'yjs'
 *   import { GeckoProvider } from 'y-websocket'
 *   const doc = new Y.Doc()
 *   const provider = new GeckoProvider('http://localhost:1234', 'my-document-name', doc)
 *
 * @extends {Observable<string>}
 */
export class GeckoProvider extends Observable<string> {
  bcChannel: string;
  url: string;
  authorization: string;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  gecko: ClientChannel;
  geckoConnected: boolean;
  geckoConnecting: boolean;
  bcConnected: boolean;
  geckoUnsuccessfulReconnects: number;
  messageHandlers: MessageHandler[];
  _synced: boolean;
  geckoLastMessageReceived: number;
  shouldConnect: boolean;
  _resyncInterval: any;
  _checkInterval: any;
  _bcSubscriber: (data, origin) => void;
  _updateHandler: (update, handler) => void;
  _awarenessUpdateHandler: ({ added, updated, removed }, origin) => void;
  _beforeUnloadHandler: () => void;

  /**
   * @param {string} serverUrl
   * @param {string} docId
   * @param {Y.Doc} doc
   * @param {object} [opts]
   * @param {boolean} [opts.connect]
   * @param {awarenessProtocol.Awareness} [opts.awareness]
   * @param {Object<string,string>} [opts.params]
   * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
   */
  constructor(
    serverUrl,
    docId,
    doc,
    {
      connect = true,
      awareness = new awarenessProtocol.Awareness(doc),
      params = {},
      resyncInterval = -1,
    } = {}
  ) {
    super();
    this.authorization = JSON.stringify({
      docId,
      ...params
    });
    this.bcChannel = docId;
    this.url = serverUrl;
    this.doc = doc;
    this.awareness = awareness;
    this.geckoConnected = false;
    this.geckoConnecting = false;
    this.bcConnected = false;
    this.geckoUnsuccessfulReconnects = 0;
    this.messageHandlers = messageHandlers.slice();
    this.gecko = null;
    /**
     * @type {boolean}
     */
    this._synced = false;
    this.geckoLastMessageReceived = 0;
    /**
     * Whether to connect to other peers or not
     * @type {boolean}
     */
    this.shouldConnect = connect;

    /**
     * @type {number}
     */
    this._resyncInterval = 0;
    if (resyncInterval > 0) {
      this._resyncInterval = /** @type {any} */ setInterval(() => {
        if (this.gecko) {
          // resend sync step 1
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, MESSAGE_SYNC_ID);
          syncProtocol.writeSyncStep1(encoder, doc);
          this.gecko.raw.emit(encoding.toUint8Array(encoder));
        }
      }, resyncInterval);
    }

    /**
     * @param {ArrayBuffer} data
     */
    this._bcSubscriber = (data, origin) => {
      if (origin !== this) {
        const encoder = readMessage(this, new Uint8Array(data), false);
        if (encoding.length(encoder) > 1) {
          bc.publish(this.bcChannel, encoding.toUint8Array(encoder), this);
        }
      }
    };
    /**
     * Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
     * @param {Uint8Array} update
     * @param {any} origin
     */
    this._updateHandler = (update, origin) => {
      if (origin !== this) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_SYNC_ID);
        syncProtocol.writeUpdate(encoder, update);
        broadcastMessage(this, encoding.toUint8Array(encoder));
      }
    };
    this.doc.on("update", this._updateHandler);
    /**
     * @param {any} changed
     * @param {any} origin
     */
    this._awarenessUpdateHandler = ({ added, updated, removed }, origin) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS_ID);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      );
      broadcastMessage(this, encoding.toUint8Array(encoder));
    };
    this._beforeUnloadHandler = () => {
      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        [doc.clientID],
        "window unload"
      );
    };
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this._beforeUnloadHandler);
    } else if (typeof process !== "undefined") {
      process.on("exit", this._beforeUnloadHandler);
    }
    awareness.on("update", this._awarenessUpdateHandler);
    this._checkInterval = /** @type {any} */ setInterval(() => {
      if (
        this.geckoConnected &&
        messageReconnectTimeout <
          time.getUnixTime() - this.geckoLastMessageReceived
      ) {
        // no message received in a long time - not even your own awareness
        // updates (which are updated every 15 seconds)
        this.gecko.close();
      }
    }, messageReconnectTimeout / 10);
    if (connect) {
      this.connect();
    }
  }

  /**
   * @type {boolean}
   */
  get synced() {
    return this._synced;
  }

  set synced(state) {
    if (this._synced !== state) {
      this._synced = state;
      this.emit("synced", [state]);
      this.emit("sync", [state]);
    }
  }

  destroy() {
    if (this._resyncInterval !== 0) {
      clearInterval(this._resyncInterval);
    }
    clearInterval(this._checkInterval);
    this.disconnect();
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this._beforeUnloadHandler);
    } else if (typeof process !== "undefined") {
      process.off("exit", this._beforeUnloadHandler);
    }
    this.awareness.off("update", this._awarenessUpdateHandler);
    this.doc.off("update", this._updateHandler);
    super.destroy();
  }

  connectBc() {
    if (!this.bcConnected) {
      bc.subscribe(this.bcChannel, this._bcSubscriber);
      this.bcConnected = true;
    }
    // write sync step 1
    const encoderSync = encoding.createEncoder();
    encoding.writeVarUint(encoderSync, MESSAGE_SYNC_ID);
    syncProtocol.writeSyncStep1(encoderSync, this.doc);
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderSync), this);
    // broadcast local state
    const encoderState = encoding.createEncoder();
    encoding.writeVarUint(encoderState, MESSAGE_SYNC_ID);
    syncProtocol.writeSyncStep2(encoderState, this.doc);
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderState), this);
    // write queryAwareness
    const encoderAwarenessQuery = encoding.createEncoder();
    encoding.writeVarUint(encoderAwarenessQuery, MESSAGE_QUERY_AWARENESS_ID);
    bc.publish(
      this.bcChannel,
      encoding.toUint8Array(encoderAwarenessQuery),
      this
    );
    // broadcast local awareness state
    const encoderAwarenessState = encoding.createEncoder();
    encoding.writeVarUint(encoderAwarenessState, MESSAGE_AWARENESS_ID);
    encoding.writeVarUint8Array(
      encoderAwarenessState,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID,
      ])
    );
    bc.publish(
      this.bcChannel,
      encoding.toUint8Array(encoderAwarenessState),
      this
    );
  }

  disconnectBc() {
    // broadcast message with local awareness state set to null (indicating disconnect)
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_AWARENESS_ID);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        [this.doc.clientID],
        new Map()
      )
    );
    broadcastMessage(this, encoding.toUint8Array(encoder));
    if (this.bcConnected) {
      bc.unsubscribe(this.bcChannel, this._bcSubscriber);
      this.bcConnected = false;
    }
  }

  disconnect() {
    this.shouldConnect = false;
    this.disconnectBc();
    if (this.gecko !== null) {
      this.gecko.close();
    }
  }

  connect() {
    this.shouldConnect = true;
    if (!this.geckoConnected && this.gecko === null) {
      setupGecko(this, this.authorization);
      this.connectBc();
    }
  }
}
