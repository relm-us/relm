import type { WebsocketProvider } from "./WebsocketProvider.js";

import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

export function readMessage(
  provider: WebsocketProvider,
  buf: Uint8Array,
  emitSynced: boolean
): encoding.Encoder {
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
}
