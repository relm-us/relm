import GeckoServer, { ServerChannel } from "@geckos.io/server";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";

import { getWithDefault } from "./utils/getWithDefault.js";
import { AuthResult, isAuthorized } from "./isAuthorized.js";

type Participant = {
  enabled: boolean;
  id: string;
  x: number;
  y: number;
  z: number;
};

type Relm = {
  participants: Map<string, Participant>;
};

const activeRelms = new Map<string, Relm>();

let tick = 0;

// Logical processor that tracks data at a point in time, and compresses it
// so that only the necessary new information is sent across the wire.
const SI = new SnapshotInterpolation(30);

export const geckoServer = GeckoServer({
  // Required since client is on separate domain
  cors: { allowAuthorization: true, origin: "*" },

  authorization: async (authorizationStr) => {
    let params;
    try {
      params = JSON.parse(authorizationStr);
    } catch (error) {
      console.log(
        `Invalid authorization string received: "${authorizationStr}"`
      );
      return 401;
    }

    const docId = params["docId"];
    const participantId = params["participant-id"];

    console.log("gecko participant connected:", participantId);

    const result: AuthResult = await isAuthorized(docId, {
      participantId,
      sig: params["participant-sig"],
      x: params["pubkey-x"],
      y: params["pubkey-y"],
    });

    switch (result.kind) {
      case "authorized":
        return {
          docId,
          participantId,
        };

      case "unauthorized":
        console.log(
          `gecko participant ${participantId} denied entry to ${docId}`,
          result.log
        );
        return 401;

      case "error":
        console.log(
          `gecko participant ${participantId} error trying to enter ${docId}`,
          result.log
        );
        return 404;
    }
  },
});

/**
 * The main UDP "connection" from a client to the server is established here.
 */
geckoServer.onConnection((channel: ServerChannel) => {
  const relmDocId = channel.userData.docId;

  // If this is the first participant in the relm, create the room for the relm;
  // otherwise, return the room
  let relm = getWithDefault(activeRelms, relmDocId, () => ({
    participants: new Map(),
  }));

  let participant = getWithDefault(relm.participants, channel.id, () => ({
    enabled: false,
    id: channel.userData.participantId,
    x: 0,
    y: 0,
    z: 0,
  }));

  // If the client disconnects...
  channel.onDisconnect(() => {
    relm.participants.delete(channel.id);

    // TODO: Clean up room if this is the last participant in it?
    // if (relm.participants.size === 0) {
    //   delete activeRelms[relmId];
    //   relm = null;
    // }

    participant = null;
  });

  channel.on("move", (data) => {
    participant.enabled = true;
    participant.x = data[0];
    participant.y = data[1];
    participant.z = data[2];
  });

  // Join the gecko "room" corresponding to the authorized `docId`
  setTimeout(() => {
    channel.join(relmDocId);
  }, 1000);
});

const loop = () => {
  tick++;

  // Every second, show debug info
  if (tick % 60 === 0) console.log(Array.from(activeRelms.keys()));

  if (tick % 2 === 0) {
    for (let [relmDocId, relm] of activeRelms.entries()) {
      const relmState = [];

      for (let participant of relm.participants.values()) {
        relmState.push(participant);
        // relmState.push({
        // id: participant.uuid,
        // x: participant.x,
        // y: participant.y,
        // z: participant.z,
        // theta: participant.theta,
        // headTheta: participant.headTheta,
        // oculusOffset: participant.oculusOffset,
        // clipIndex: participant.clipIndex,
        // animLoop: participant.animLoop,
        // });
      }

      const snapshot = SI.snapshot.create(relmState);
      SI.vault.add(snapshot);
      geckoServer.room(relmDocId).emit("update", snapshot);
    }
  }
};

// Server calculates position at 60 fps, but sends a snapshot at 30 fps
setInterval(loop, 1000 / 60);
