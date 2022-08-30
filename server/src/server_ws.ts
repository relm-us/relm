import WebSocket from "ws";
import { createServer } from "http";
import { setupWSConnection } from "relm-common";

import { app } from "./server_http.js";
import { ydocStats } from "./getYDoc.js";

import { AuthResult, isAuthorized } from "./isAuthorized.js";

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

  console.log("websocket participant connected:", participantId);

  const result: AuthResult = await isAuthorized(docId, {
    participantId,
    sig: participantSig,
    x: pubkeyX,
    y: pubkeyY,
  });

  switch (result.kind) {
    case "authorized":
      wss.handleUpgrade(req, socket as any, head, (conn) => {
        wss.emit("connection", conn, req);
      });
      break;

    case "unauthorized":
      console.log(
        `websocket participant ${participantId} denied entry to ${docId}`,
        result.log
      );
      closeSocket(socket, "401", result.msg);
      break;

    case "error":
      console.log(
        `websocket participant ${participantId} error trying to enter ${docId}`,
        result.log
      );
      closeSocket(socket, "404", result.msg);
      break;
  }
});
