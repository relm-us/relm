import WebSocket from "ws";
import { createServer } from "http";
import * as yws from "y-websocket/bin/utils";

import { app } from "./server_http";
import { Player, Permission, Doc } from "./db";

export const server = createServer();

let wss = new WebSocket.Server({ noServer: true });

const empty = (val) => val === null || val === undefined || val === "";

wss.on("connection", (conn, req) => {
  yws.setupWSConnection(conn, req, {
    callbackHandler: async (update, origin, doc) => {
      const entities = doc.getArray("entities");

      let assetsCount = 0;
      entities.forEach((entity) => {
        const components = entity.get("components").toArray();
        if (
          components.some((component) => {
            const name = component.get("name");
            return (
              (name === "Model" &&
                !empty(component.get("values").get("asset")?.url)) ||
              (name === "Image" &&
                !empty(component.get("values").get("asset")?.url)) ||
              (name === "Shape" &&
                !empty(component.get("values").get("texture")?.url)) ||
              (name === "Skybox" &&
                !empty(component.get("values").get("image")?.url))
            );
          })
        )
          assetsCount++;
      });
      const entitiesCount = entities.length;

      const docBefore = await Doc.getDocWithRelmName({ docId: doc.name });
      console.log(
        `Storing stats for '${docBefore.relmName}':\n` +
          `  entities: ${entitiesCount} (was ${docBefore.entitiesCount})\n` +
          `  assets: ${assetsCount} (was ${docBefore.assetsCount})`
      );

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

    let permitted;
    if (doc.relmId in permissions) {
      permitted = permissions[doc.relmId].includes("access");
    } else if ("*" in permissions) {
      permitted = permissions["*"].includes("access");
    } else {
      permitted = false;
    }

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
        params
      );
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
    }
  }
});
