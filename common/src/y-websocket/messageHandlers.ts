import type { WebsocketProvider } from "./WebsocketProvider.js";

import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as syncProtocol from "y-protocols/sync";
import * as authProtocol from "y-protocols/auth";
import * as awarenessProtocol from "y-protocols/awareness";

import {
  messageSync,
  messageAwareness,
  messageAuth,
  messageQueryAwareness,
} from "./config.js";

export type MessageHandler = (
  encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: WebsocketProvider,
  emitSynced: boolean,
  messageType: number
) => void;

export const messageHandlers: MessageHandler[] = [];

// 0
messageHandlers[messageSync] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  encoding.writeVarUint(encoder, messageSync);
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

// 1
messageHandlers[messageAwareness] = (
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

// 2
messageHandlers[messageAuth] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  authProtocol.readAuthMessage(decoder, provider.doc, permissionDeniedHandler);
};

// 3
messageHandlers[messageQueryAwareness] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  encoding.writeVarUint(encoder, messageAwareness);
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(
      provider.awareness,
      Array.from(provider.awareness.getStates().keys())
    )
  );
};

const permissionDeniedHandler = (provider: WebsocketProvider, reason: string) =>
  console.warn(`Permission denied to access ${provider.url}.\n${reason}`);
