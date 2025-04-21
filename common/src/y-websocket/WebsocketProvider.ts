import type * as Y from "yjs"
import * as bc from "lib0/broadcastchannel"
import * as time from "lib0/time"
import * as encoding from "lib0/encoding"
import * as syncProtocol from "y-protocols/sync"
import * as awarenessProtocol from "y-protocols/awareness"
import { Observable } from "lib0/observable"
import * as url from "lib0/url"

import {
  messageSync,
  messageAwareness,
  messageQueryAwareness,
  messageReconnectTimeout,
  // unload
  addUnloadListener,
  removeUnloadListener,
} from "./config.js"

import { connectWebsocketToProvider } from "./connectWebsocketToProvider.js"
import { type MessageHandler, messageHandlers } from "./messageHandlers.js"
import { readMessage } from "./readMessage.js"

const broadcastMessage = (provider: WebsocketProvider, buf: ArrayBuffer) => {
  if (provider.wsconnected) {
    /** @type {WebSocket} */ provider.ws.send(buf)
  }
  if (provider.bcconnected) {
    bc.publish(provider.bcChannel, buf, provider)
  }
}

/**
 * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
 * The document name is attached to the provided url. I.e. the following example
 * creates a websocket connection to http://localhost:1234/my-document-name
 *
 * @example
 *   import * as Y from 'yjs'
 *   import { WebsocketProvider } from 'y-websocket'
 *   const doc = new Y.Doc()
 *   const provider = new WebsocketProvider('http://localhost:1234', 'my-document-name', doc)
 *
 * @extends {Observable<string>}
 */
export class WebsocketProvider extends Observable<string> {
  bcChannel: string
  url: string
  roomname: string
  doc: Y.Doc
  _WS: typeof WebSocket
  awareness: awarenessProtocol.Awareness
  wsconnected: boolean
  wsconnecting: boolean
  bcconnected: boolean
  wsUnsuccessfulReconnects: number
  messageHandlers: MessageHandler[]
  _synced: boolean
  ws: WebSocket
  wsLastMessageReceived: number
  shouldConnect: boolean
  _resyncInterval: any
  _checkInterval: any
  _bcSubscriber: (data, origin) => void
  _updateHandler: (update, handler) => void
  _awarenessUpdateHandler: ({ added, updated, removed }, origin) => void
  _beforeUnloadHandler: () => void

  /**
   * @param {string} serverUrl
   * @param {string} roomname
   * @param {Y.Doc} doc
   * @param {object} [opts]
   * @param {boolean} [opts.connect]
   * @param {awarenessProtocol.Awareness} [opts.awareness]
   * @param {Object<string,string>} [opts.params]
   * @param {typeof WebSocket} [opts.WebSocketPolyfill] Optionall provide a WebSocket polyfill
   * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
   */
  constructor(
    serverUrl,
    roomname,
    doc,
    {
      connect = true,
      awareness = new awarenessProtocol.Awareness(doc),
      params = {},
      WebSocketPolyfill = WebSocket,
      resyncInterval = -1,
    } = {},
  ) {
    super()
    // ensure that url is always ends with /
    while (serverUrl[serverUrl.length - 1] === "/") {
      serverUrl = serverUrl.slice(0, serverUrl.length - 1)
    }
    const encodedParams = url.encodeQueryParams(params)
    this.bcChannel = serverUrl + "/" + roomname
    this.url = serverUrl + "/" + roomname + (encodedParams.length === 0 ? "" : "?" + encodedParams)
    this.roomname = roomname
    this.doc = doc
    this._WS = WebSocketPolyfill
    this.awareness = awareness
    this.wsconnected = false
    this.wsconnecting = false
    this.bcconnected = false
    this.wsUnsuccessfulReconnects = 0
    this.messageHandlers = messageHandlers.slice()
    /**
     * @type {boolean}
     */
    this._synced = false
    /**
     * @type {WebSocket?}
     */
    this.ws = null
    this.wsLastMessageReceived = 0
    /**
     * Whether to connect to other peers or not
     * @type {boolean}
     */
    this.shouldConnect = connect

    /**
     * @type {number}
     */
    this._resyncInterval = 0
    if (resyncInterval > 0) {
      this._resyncInterval = /** @type {any} */ setInterval(() => {
        if (this.ws) {
          // resend sync step 1
          const encoder = encoding.createEncoder()
          encoding.writeVarUint(encoder, messageSync)
          syncProtocol.writeSyncStep1(encoder, doc)
          this.ws.send(encoding.toUint8Array(encoder))
        }
      }, resyncInterval)
    }

    /**
     * @param {ArrayBuffer} data
     */
    this._bcSubscriber = (data, origin) => {
      if (origin !== this) {
        const encoder = readMessage(this, new Uint8Array(data), false)
        if (encoding.length(encoder) > 1) {
          bc.publish(this.bcChannel, encoding.toUint8Array(encoder), this)
        }
      }
    }
    /**
     * Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
     * @param {Uint8Array} update
     * @param {any} origin
     */
    this._updateHandler = (update, origin) => {
      if (origin !== this) {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeUpdate(encoder, update)
        broadcastMessage(this, encoding.toUint8Array(encoder))
      }
    }
    this.doc.on("update", this._updateHandler)
    /**
     * @param {any} changed
     * @param {any} origin
     */
    this._awarenessUpdateHandler = ({ added, updated, removed }, origin) => {
      const changedClients = added.concat(updated).concat(removed)
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients))
      broadcastMessage(this, encoding.toUint8Array(encoder))
    }
    this._beforeUnloadHandler = () => {
      awarenessProtocol.removeAwarenessStates(this.awareness, [doc.clientID], "window unload")
    }

    addUnloadListener(this._beforeUnloadHandler)

    awareness.on("update", this._awarenessUpdateHandler)
    this._checkInterval = /** @type {any} */ setInterval(() => {
      if (this.wsconnected && messageReconnectTimeout < time.getUnixTime() - this.wsLastMessageReceived) {
        // no message received in a long time - not even your own awareness
        // updates (which are updated every 15 seconds)
        /** @type {WebSocket} */ this.ws.close()
      }
    }, messageReconnectTimeout / 10)
    if (connect) {
      this.connect()
    }
  }

  /**
   * @type {boolean}
   */
  get synced() {
    return this._synced
  }

  set synced(state) {
    if (this._synced !== state) {
      this._synced = state
      this.emit("synced", [state])
      this.emit("sync", [state])
    }
  }

  destroy() {
    if (this._resyncInterval !== 0) {
      clearInterval(this._resyncInterval)
    }
    clearInterval(this._checkInterval)
    this.disconnect()

    removeUnloadListener(this._beforeUnloadHandler)

    this.awareness.off("update", this._awarenessUpdateHandler)
    this.doc.off("update", this._updateHandler)
    super.destroy()
  }

  connectBc() {
    if (!this.bcconnected) {
      bc.subscribe(this.bcChannel, this._bcSubscriber)
      this.bcconnected = true
    }
    // write sync step 1
    const encoderSync = encoding.createEncoder()
    encoding.writeVarUint(encoderSync, messageSync)
    syncProtocol.writeSyncStep1(encoderSync, this.doc)
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderSync), this)
    // broadcast local state
    const encoderState = encoding.createEncoder()
    encoding.writeVarUint(encoderState, messageSync)
    syncProtocol.writeSyncStep2(encoderState, this.doc)
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderState), this)
    // write queryAwareness
    const encoderAwarenessQuery = encoding.createEncoder()
    encoding.writeVarUint(encoderAwarenessQuery, messageQueryAwareness)
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderAwarenessQuery), this)
    // broadcast local awareness state
    const encoderAwarenessState = encoding.createEncoder()
    encoding.writeVarUint(encoderAwarenessState, messageAwareness)
    encoding.writeVarUint8Array(
      encoderAwarenessState,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.doc.clientID]),
    )
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderAwarenessState), this)
  }

  disconnectBc() {
    // broadcast message with local awareness state set to null (indicating disconnect)
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageAwareness)
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.doc.clientID], new Map()),
    )
    broadcastMessage(this, encoding.toUint8Array(encoder))
    if (this.bcconnected) {
      bc.unsubscribe(this.bcChannel, this._bcSubscriber)
      this.bcconnected = false
    }
  }

  disconnect() {
    this.shouldConnect = false
    this.disconnectBc()
    if (this.ws !== null) {
      this.ws.close()
    }
  }

  connect() {
    this.shouldConnect = true
    if (!this.wsconnected && this.ws === null) {
      connectWebsocketToProvider(this)
      this.connectBc()
    }
  }
}
