
import * as syncProtocol from "y-protocols/sync";
import * as authProtocol from "y-protocols/auth";
import * as awarenessProtocol from "y-protocols/awareness";
import { decoding, encoding } from "lib0";
import { GeckoProvider } from "./y-gecko.js";
import { WebsocketProvider } from "./y-websocket.js";

export type MessageHandler = (
  encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: GeckoProvider|WebsocketProvider,
  emitSynced: boolean,
  messageType: number
) => void;

export const MESSAGE_SYNC_ID = 0;
export const MESSAGE_AWARENESS_ID = 1;
export const MESSAGE_AUTH_ID = 2;
export const MESSAGE_QUERY_AWARENESS_ID = 3;

/**
 *                       encoder,          decoder,          provider,          emitSynced, messageType
 * @type {Array<function(encoding.Encoder, decoding.Decoder, GeckoProvider|WebsocketProvider, boolean,    number):void>}
 */
export const messageHandlers: MessageHandler[] = [];

messageHandlers[MESSAGE_SYNC_ID] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  encoding.writeVarUint(encoder, MESSAGE_SYNC_ID);
  const syncMessageType = syncProtocol.readSyncMessage(
    decoder,
    encoder,
    provider.doc,
    provider
  );
  if (
    emitSynced &&
    syncMessageType === syncProtocol.messageYjsSyncStep2 &&
    !provider.synced
  ) {
    provider.synced = true;
  }
};

messageHandlers[MESSAGE_QUERY_AWARENESS_ID] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  encoding.writeVarUint(encoder, MESSAGE_AWARENESS_ID);
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(
      provider.awareness,
      Array.from(provider.awareness.getStates().keys())
    )
  );
};

messageHandlers[MESSAGE_AWARENESS_ID] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  awarenessProtocol.applyAwarenessUpdate(
    provider.awareness,
    decoding.readVarUint8Array(decoder),
    provider
  );
};

messageHandlers[MESSAGE_AUTH_ID] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  authProtocol.readAuthMessage(decoder, provider.doc, permissionDeniedHandler);
};

/**
 * @param {GeckoProvider} provider
 * @param {string} reason
 */
 const permissionDeniedHandler = (provider, reason) =>
  console.warn(`Permission denied to access ${provider.url}.\n${reason}`);