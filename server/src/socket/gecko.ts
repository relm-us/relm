import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import { encoding } from "lib0";
import { ServerChannel } from "@geckos.io/server";

import { ydocStats } from "../ydocStats.js";
import { defaultCallbackHandler, isDefaultCallbackSet, messageAwareness, messageSync, ProviderSharedDoc } from "./common.js";
import { getGeckoYDoc } from "../utils/yDoc.js";

export const handler = async channel => {
  const doc = await getGeckoYDoc(channel.userData.docId, { callbackHandler: ydocStats });
  doc.conns.set(channel, new Set());

  channel.onRaw(buffer => {
    const message = new Uint8Array(buffer as Buffer);
    doc.handlePacket(channel, new Uint8Array(message));
  });

  channel.onDisconnect(() => {
    const controlledIds = doc.conns.get(channel);
    doc.conns.delete(channel);

    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null
    );
  });

  if (doc.whenSynced) {
    await doc.whenSynced;
  }

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  channel.raw.emit(encoding.toUint8Array(encoder));
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
    channel.raw.emit(encoding.toUint8Array(encoder));
  }
};

export class GeckoSharedDoc extends ProviderSharedDoc<ServerChannel> {
  /**
   * @param {string} name
   */
  constructor(
    name,
    { callbackHandler = isDefaultCallbackSet ? defaultCallbackHandler : null } : { callbackHandler: any }
  ) {
    super(name, { callbackHandler });
  }

  send(conn: ServerChannel, buffer: Uint8Array) {
    try {
      conn.raw.emit(buffer);
    } catch (error) {
      conn.close();
    }
  }
  
}