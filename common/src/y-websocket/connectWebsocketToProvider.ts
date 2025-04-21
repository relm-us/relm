import type { WebsocketProvider } from "./WebsocketProvider.js"

import * as time from "lib0/time"
import * as encoding from "lib0/encoding"
import * as syncProtocol from "y-protocols/sync"
import * as awarenessProtocol from "y-protocols/awareness"
import * as math from "lib0/math"

import { messageSync, messageAwareness, reconnectTimeoutBase, maxReconnectTimeout } from "./config.js"

import { readMessage } from "./readMessage.js"

export function connectWebsocketToProvider(provider: WebsocketProvider) {
  if (provider.shouldConnect && provider.ws === null) {
    const websocket = new provider._WS(provider.url)
    websocket.binaryType = "arraybuffer"
    provider.ws = websocket
    provider.wsconnecting = true
    provider.wsconnected = false
    provider.synced = false

    websocket.onmessage = (event) => {
      provider.wsLastMessageReceived = time.getUnixTime()
      const encoder = readMessage(provider, new Uint8Array(event.data), true)
      if (encoding.length(encoder) > 1) {
        websocket.send(encoding.toUint8Array(encoder))
      }
    }
    websocket.onclose = () => {
      provider.ws = null
      provider.wsconnecting = false
      if (provider.wsconnected) {
        provider.wsconnected = false
        provider.synced = false
        // update awareness (all users except local left)
        awarenessProtocol.removeAwarenessStates(
          provider.awareness,
          Array.from(provider.awareness.getStates().keys() as IterableIterator<number>).filter(
            (client) => client !== provider.doc.clientID,
          ),
          provider,
        )
        provider.emit("status", [
          {
            status: "disconnected",
          },
        ])
      } else {
        provider.wsUnsuccessfulReconnects++
      }
      // Start with no reconnect timeout and increase timeout by
      // log10(wsUnsuccessfulReconnects).
      // The idea is to increase reconnect timeout slowly and have no reconnect
      // timeout at the beginning (log(1) = 0)
      setTimeout(
        connectWebsocketToProvider,
        math.min(math.log10(provider.wsUnsuccessfulReconnects + 1) * reconnectTimeoutBase, maxReconnectTimeout),
        provider,
      )
    }
    websocket.onopen = () => {
      provider.wsLastMessageReceived = time.getUnixTime()
      provider.wsconnecting = false
      provider.wsconnected = true
      provider.wsUnsuccessfulReconnects = 0
      provider.emit("status", [
        {
          status: "connected",
        },
      ])
      // always send sync step 1 when connected
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageSync)
      syncProtocol.writeSyncStep1(encoder, provider.doc)
      websocket.send(encoding.toUint8Array(encoder))
      // broadcast local awareness state
      if (provider.awareness.getLocalState() !== null) {
        const encoderAwarenessState = encoding.createEncoder()
        encoding.writeVarUint(encoderAwarenessState, messageAwareness)
        encoding.writeVarUint8Array(
          encoderAwarenessState,
          awarenessProtocol.encodeAwarenessUpdate(provider.awareness, [provider.doc.clientID]),
        )
        websocket.send(encoding.toUint8Array(encoderAwarenessState))
      }
    }

    provider.emit("status", [
      {
        status: "connecting",
      },
    ])
  }
}
