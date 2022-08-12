import GeckoServer from "@geckos.io/server";
import { encoding } from "lib0";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";

import { Participant, Permission, Doc } from "./db/index.js";
import { ydocStats } from "./getYDoc.js";
import { hasPermission, getYDoc } from "./utils/index.js";

function getRelmDocFromRequest(req) {
  return req.url.slice(1).split("?")[0];
}

function getUrlParams(requestUrl) {
  const queryString = requestUrl.slice(requestUrl.indexOf("?"));
  return new URLSearchParams(queryString);
}

const messageSync = 0;
const messageAwareness = 1;

export const geckoServer = GeckoServer({
  cors: { allowAuthorization: true, origin: "*" }, // Required since client is on separate domain

  authorization: async authorizationStr => {
    let params;
    try {
      params = JSON.parse(authorizationStr);
    } catch (error) {
      console.log("Invalid authorization string recieved.");
      return 401;
    }
  
    const docId = params["docId"];
    const participantId = params["participant-id"];
    const participantSig = params["participant-sig"];
    let pubkeyX = params["pubkey-x"];
    let pubkeyY = params["pubkey-y"];

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
      console.warn("can't upgrade", err);
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
  console.log("CONNECT");
  const doc = await getYDoc(channel.userData.docId, { callbackHandler: ydocStats });
  doc.conns.set(channel, new Set());

  channel.onRaw(event => {
    console.log(event, "raw event");
    // messageListener(channel, doc, new Uint8Array(message))
  });

  channel.onDisconnect(() => {
    console.log("DISCONNECT DETECTED ON CHANNEL. SHOULD CLOSE CONNECTION");
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