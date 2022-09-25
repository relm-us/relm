import type * as Y from "yjs";

import WebSocket from "ws";
import { createServer } from "http";
import { setupWSConnection } from "relm-common";
import debounce from "lodash.debounce";

import { app } from "./server_http.js";
import { ydocStats } from "./ydocStats.js";

import { AuthResult, isAuthorized } from "./isAuthorized.js";

export const server = createServer();

const CALLBACK_DEBOUNCE_WAIT = 2000;
const CALLBACK_DEBOUNCE_MAXWAIT = 10000;

const wss = new WebSocket.Server({ noServer: true });

const attendance = new Map<string, number>();
const attendanceAdd = (key, count) => {
  const newCount = (attendance.get(key) ?? 0) + count;
  attendance.set(key, newCount);
  return newCount;
};

const ydocStatsDb = debounce(ydocStats, CALLBACK_DEBOUNCE_WAIT, {
  maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
});

const onUpdateDoc = (update, origin, doc: Y.Doc) => {
  ydocStatsDb(update, origin, doc);
};

wss.on("connection", async (conn, req, relmDoc) => {
  const relmId = relmDoc.relmId;
  const relmName = relmDoc.relmName;
  const participantId = getUrlParams(req.url).get("participant-id");

  // Each participant connects twice, once on the "permanent" relmDoc,
  // and once on the "transient" relmDoc; we only care about tracking
  // the "permanent" one.
  if (relmDoc.docType === "permanent") {
    const doc = await setupWSConnection(conn, req, {
      onClose: (doc) => {
        if (relmDoc.docType === "permanent") {
          const count = attendanceAdd(relmId, -1);
          console.log(
            `Relm attendance in ${relmName} is ${count} ('${participantId}' left)`
          );
        }
      },
    });

    const count = attendanceAdd(relmId, 1);
    console.log(
      `Relm attendance in ${relmName} is ${count} ('${participantId}' joined)`
    );

    // If this is the same open doc as previously been created, then
    // `.on("update", ...)` will essentially be a no-op, because it
    // is setting same listener function as before.
    doc.on("update", onUpdateDoc);
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

  // console.log("websocket participant connected:", participantId);

  const result: AuthResult = await isAuthorized(docId, {
    participantId,
    sig: participantSig,
    x: pubkeyX,
    y: pubkeyY,
  });

  switch (result.kind) {
    case "authorized":
      wss.handleUpgrade(req, socket as any, head, (conn) => {
        wss.emit("connection", conn, req, result.doc);
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
