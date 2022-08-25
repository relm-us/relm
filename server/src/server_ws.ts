import WebSocket from "ws";
import { createServer } from "http";
import { setupWSConnection } from "relm-common";

import { app } from "./server_http.js";
import { Participant, Permission, Doc } from "./db/index.js";
import { ydocStats } from "./getYDoc.js";
import { hasPermission } from "./utils/hasPermission.js";

export const server = createServer();

let wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req, {
    callbackHandler: ydocStats,
  });
});

server.on("request", app);

function getRelmDocFromRequest(req) {
  return req.url.slice(1).split("?")[0];
}

function getUrlParams(requestUrl) {
  const queryString = requestUrl.slice(requestUrl.indexOf("?"));
  return new URLSearchParams(queryString);
}

server.on("upgrade", async (req, socket, head) => {
  const docId = getRelmDocFromRequest(req);
  const params = getUrlParams(req.url);

  const participantId = params.get("participant-id");
  const participantSig = params.get("participant-sig");
  let pubkeyX = params.get("pubkey-x");
  let pubkeyY = params.get("pubkey-y");
  console.log("participant connected:", participantId);

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
  if (verifiedPubKey) {
    // Get relm from docId
    const doc = await Doc.getDoc({ docId });

    const permissions = await Permission.getPermissions({
      participantId,
      relmIds: [doc.relmId],
    });

    const permitted = hasPermission("access", permissions, doc.relmId);

    if (permitted) {
      if (doc === null) {
        console.log(
          `Participant '${participantId}' sought to sync doc '${docId}' but was rejected because it doesn't exist`
        );
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.destroy();
      } else {
        wss.handleUpgrade(req, socket as any, head, (conn) => {
          wss.emit("connection", conn, req);
        });
      }
    } else {
      console.log(
        `Participant '${participantId}' sought to enter '${docId}' but was rejected because unauthorized`,
        params,
        permissions
      );
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
    }
  }
});