import WebSocket from "ws";
import { createServer } from "http";
import * as yws from "y-websocket/bin/utils";

import { app } from "./server_http";
import { Player, Permission, Doc } from "./db";
import { ydocStats } from "./getYDoc";
import { hasPermission } from "./utils/hasPermission";

export const server = createServer();

let wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (conn, req) => {
  yws.setupWSConnection(conn, req, {
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

  const playerId = params.get("id");
  const sig = params.get("s");
  let x = params.get("x");
  let y = params.get("y");
  console.log("participant connected:", playerId);

  let verifiedPubKey;
  try {
    verifiedPubKey = await Player.findOrCreateVerifiedPubKey({
      playerId,
      sig,
      x,
      y,
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
      playerId,
      relmIds: [doc.relmId],
    });

    const permitted = hasPermission("access", permissions, doc.relmId);

    if (permitted) {
      if (doc === null) {
        console.log(
          `Participant '${playerId}' sought to sync doc '${docId}' but was rejected because it doesn't exist`
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
        `Participant '${playerId}' sought to enter '${docId}' but was rejected because unauthorized`,
        params,
        permissions
      );
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
    }
  }
});
