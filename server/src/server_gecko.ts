import GeckoServer from "@geckos.io/server";

import { Participant, Permission, Doc } from "./db/index.js";
import { hasPermission } from "./utils/index.js";
import { setupGeckoConnection } from "./socket/gecko.js";

const storage = new Map();

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

    console.log("gecko participant connected:", participantId);
  
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
      docId,
      participantId
    };
  }
});

geckoServer.onConnection(channel => setupGeckoConnection(storage, channel));