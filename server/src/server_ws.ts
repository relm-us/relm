import GeckoServer, { ServerChannel } from "@geckos.io/server";
import { decoding, encoding } from "lib0";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";

import { Participant, Permission, Doc } from "./db/index.js";
import { ydocStats } from "./getYDoc.js";
import { hasPermission, getYDoc } from "./utils/index.js";
import { WSSharedDoc } from "ws/WSSharedDoc.js";

const messageSync = 0;
const messageAwareness = 1;

export const geckoServer = GeckoServer({
  cors: { allowAuthorization: true, origin: "*" }, // Required since client is on separate domain

  authorization: async authorizationStr => {
    let params;
    try {
      params = JSON.parse(authorizationStr);
    } catch (error) {
      console.log(`Invalid authorization string recieved: "${authorizationStr}"`);
      return 401;
    }
  
    const docId = params["docId"];
    const participantId = params["participant-id"];
    const participantSig = params["participant-sig"];
    const pubkeyX = params["pubkey-x"];
    const pubkeyY = params["pubkey-y"];

    console.log("participant connected:", participantId, docId, params);
  
    let verifiedPubKey;
    try {
      verifiedPubKey = await Participant.findOrCreateVerifiedPubKey({
        participantId,
        sig: participantSig,
        x: pubkeyX,
        y: pubkeyY,
      });
    } catch (err) {
      console.warn("can't verify public key", err);
      return;
    }
  
    // Check that we are authenticated first
    if (!verifiedPubKey) {
      console.log(`Invalid public key from participant '${participantId}'`);
      return false;
    }

    // Get relm from docId
    const doc = await Doc.getDoc({ docId });

    const permissions = await Permission.getPermissions({
      participantId,
      relmIds: [doc.relmId],
    });

    // Do we have permission to access this relm?
    const permitted = hasPermission("access", permissions, doc.relmId);

    if (!permitted) {
      console.log(
        `Participant '${participantId}' sought to enter '${docId}' but was rejected because unauthorized`,
        params,
        permissions
      );
      return 401;
    }

    // Does the relm doc exist?
    if (doc === null) {
      console.log(
        `Participant '${participantId}' sought to sync doc '${docId}' but was rejected because it doesn't exist`
      );
      return 404;
    }

    // Good to go!
    return {
      docId
    };
  }
});

geckoServer.onConnection(async channel => {
  const doc = await getYDoc(channel.userData.docId, { callbackHandler: ydocStats });
  doc.conns.set(channel, new Set());

  channel.onRaw(buffer => {
    const message = new Uint8Array(buffer as Buffer);
    onMessage(channel, doc, new Uint8Array(message))
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
});

async function onMessage(channel: ServerChannel, doc: WSSharedDoc, message: Uint8Array) {
  try {
    const encoder = encoding.createEncoder();
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);
    switch (messageType) {
      case messageSync:
        // await the doc state being updated from persistence, if available, otherwise
        // we may send sync step 2 too early
        if (doc.whenSynced) {
          await doc.whenSynced;
        }
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.readSyncMessage(decoder, encoder, doc, null);
        if (encoding.length(encoder) > 1) {
          channel.raw.emit(encoding.toUint8Array(encoder));
        }
        break;
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          channel
        );
        break;
      }
    }
  } catch (err) {
    console.error(err);
    doc.emit("error", [err]);
  }
}