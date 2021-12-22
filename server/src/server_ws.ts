import WebSocket from "ws";
import { createServer } from "http";
import * as yws from "y-websocket/bin/utils";

import { app } from "./server_http";
import { Player, Permission, Doc } from "./db";

export const server = createServer();

let wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (conn, req) => {
  yws.setupWSConnection(conn, req, {
    callbackHandler: async (update, origin, doc) => {
      const entities = doc.getArray("entities");
      let assetsCount = 0;
      entities.forEach((entity) => {
        const components = entity.get("components").toArray();
        if (components.some((component) => component.get("name") === "Model"))
          assetsCount++;
      });
      const entitiesCount = entities.length;
      await Doc.updateStats({
        docId: doc.name,
        entitiesCount,
        assetsCount,
      });
    },
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
    console.warn(err);
    return;
  }

  // Check that we are authenticated first
  if (verifiedPubKey) {
    // Get relm from docId
    const doc = await Doc.getDoc({ docId });

    if (doc === null) {
      console.log(
        `Visitor sought to sync doc '${docId}' but was rejected because it doesn't exist`
      );
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
    } else {
      const permissions = await Permission.getPermissions({
        playerId,
        relmId: doc.relmId,
      });

      const permitted = permissions.has("access");

      if (permitted) {
        wss.handleUpgrade(req, socket, head, (conn) => {
          wss.emit("connection", conn, req);
        });
      } else {
        console.log(
          `Visitor sought to enter '${docId}' but was rejected because unauthorized`,
          params
        );
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
      }
    }
  }
});
