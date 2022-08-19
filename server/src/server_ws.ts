import WebSocket from "ws";
import { createServer } from "http";

import { Participant, Permission, Doc } from "./db/index.js";
import { hasPermission } from "./utils/index.js";
import { app } from "./server_http.js";
import { handler } from "./socket/ws.js";
import { ydocStats } from "./ydocStats.js";

export const server = createServer();

const wss = new WebSocket.Server({ noServer: true });

server.on("request", app);

wss.on("connection", (conn, req) => handler(conn, { docName: getRelmDocFromRequest(req), callbackHandler: ydocStats }));

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
  console.log("ws participant connected:", participantId);

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