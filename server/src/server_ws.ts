import WebSocket from "ws";
import { createServer } from "http";
import debounce from "lodash.debounce";
import { setupWSConnection, WSSharedDoc } from "relm-common";

import { app } from "./server_http.js";
import { ydocStats } from "./ydocStats.js";

import { AuthResult, isAuthorized } from "./isAuthorized.js";
import { getOrCreateLiveRelm, liveRelms } from "./LiveRelm.js";
import { RelmDocWithName } from "db/doc.js";

export const server = createServer();

const CALLBACK_DEBOUNCE_WAIT = 2000;
const CALLBACK_DEBOUNCE_MAXWAIT = 10000;
const OCCUPANCY_SEND_INTERVAL = 2500;

const wss = new WebSocket.Server({ noServer: true });

const ydocStatsDb = debounce(ydocStats, CALLBACK_DEBOUNCE_WAIT, {
  maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
});

const onUpdateDoc = (_update, _origin, doc: WSSharedDoc) => {
  ydocStatsDb(doc);
};

setInterval(() => {
  for (let liveRelm of liveRelms.values()) {
    liveRelm.send();
  }
}, OCCUPANCY_SEND_INTERVAL);

wss.on("connection", async (conn, req, relmDoc: RelmDocWithName) => {
  // Each participant connects twice, once to the "permanent" relmDoc,
  // and once to the "transient" relmDoc; we only care about tracking
  // the "permanent" one.
  if (relmDoc.docType === "permanent") {
    const participantId = getUrlParams(req.url).get("participant-id");

    await setupWSConnection(conn, req, {
      onOpen: (doc: WSSharedDoc) => {
        const liveRelm = getOrCreateLiveRelm(relmDoc, doc.awareness);

        // If portals have changed since initial LiveRelm creation event,
        // update them each time a participant joins, so that a browser
        // refresh will work to show portal occupancy
        liveRelm.setPortals(relmDoc.portals);

        liveRelm.join(participantId);

        // Finally, we lazily update any cached stats in the DB
        doc.on("update", onUpdateDoc);
      },
      onClose: (doc: WSSharedDoc) => {
        const liveRelm = getOrCreateLiveRelm(relmDoc);

        liveRelm.leave(participantId);

        // Clean up listener if it's the last participant to leave the room
        if (liveRelm.occupancy === 0) {
          doc.off("update", onUpdateDoc);
        }
      },
    });
  } else {
    await setupWSConnection(conn, req);
  }
});

server.on("request", app);

function getRelmDocFromRequest(req) {
  return req.url.slice(1).split("?")[0];
}

function getUrlParams(requestUrl) {
  const queryString = requestUrl.slice(requestUrl.indexOf("?"));
  return new URLSearchParams(queryString);
}

function closeSocket(socket, errno: string, msg: string) {
  socket.write(`HTTP/1.1 ${errno} ${msg}\r\n\r\n`);
  socket.destroy();
}

server.on("upgrade", async (req, socket, head) => {
  const docId = getRelmDocFromRequest(req);
  const params = getUrlParams(req.url);

  const participantId = params.get("participant-id");
  const participantSig = params.get("participant-sig");
  let pubkeyX = params.get("pubkey-x");
  let pubkeyY = params.get("pubkey-y");

  const credentials = {
    participantId,
    sig: participantSig,
    x: pubkeyX,
    y: pubkeyY,
  };

  console.log("websocket upgrade check isAuthorized:", req.url, credentials);

  const result: AuthResult = await isAuthorized(docId, credentials);

  switch (result.kind) {
    case "authorized":
      wss.handleUpgrade(req, socket as any, head, (conn) => {
        wss.emit("connection", conn, req, result.doc);
      });
      break;

    case "unauthorized":
      console.log(`websocket participant ${participantId} denied entry to ${docId}`, result.log);
      closeSocket(socket, "401", result.msg);
      break;

    case "error":
      console.log(
        `websocket participant ${participantId} error trying to enter ${docId}`,
        result.log,
      );
      closeSocket(socket, "404", result.msg);
      break;
  }
});
