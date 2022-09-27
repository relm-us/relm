import type * as Y from "yjs";

import WebSocket from "ws";
import { createServer } from "http";
import debounce from "lodash.debounce";
import { Awareness, setupWSConnection, WSSharedDoc } from "relm-common";

import { app } from "./server_http.js";
import { ydocStats } from "./ydocStats.js";

import { AuthResult, isAuthorized } from "./isAuthorized.js";
import { Attendance } from "./Attendance.js";
import { portalsMap } from "./PortalsMap.js";

export const server = createServer();
export const attendance = new Attendance();

const CALLBACK_DEBOUNCE_WAIT = 2000;
const CALLBACK_DEBOUNCE_MAXWAIT = 10000;

const wss = new WebSocket.Server({ noServer: true });

const awarenesses = new Map<string, Awareness>();

const ydocStatsDb = debounce(ydocStats, CALLBACK_DEBOUNCE_WAIT, {
  maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
});

const onUpdateDoc = (_update, _origin, doc: WSSharedDoc) => {
  ydocStatsDb(doc);
};

attendance.on("join", (relmName, count, participantId) => {
  console.log(
    `'${relmName}' now has ${count} participants` +
      (participantId ? ` ('${participantId}' joined)` : "")
  );
});

attendance.on("leave", (relmName, count, participantId) => {
  console.log(
    `'${relmName}' now has ${count} participants` +
      (participantId ? ` ('${participantId}' left)` : "")
  );
});

const broadcastRemotePortalsAttendance = (relmName: string) => {
  const awareness = awarenesses.get(relmName);
  if (!awareness) {
    console.warn(
      `can't send attendance to relm '${relmName}', no awareness object`
    );
    return;
  }

  const portals = portalsMap.get(relmName);
  if (portals.length === 0) {
    console.warn(`no portals for '${relmName}' yet`);
    return;
  }

  const tally: Record<string, number> = {};
  for (let remoteRelmName of portals) {
    tally[remoteRelmName] = attendance.get(remoteRelmName);
  }

  awareness.setLocalState({
    type: "portals",
    attendance: tally,
  });
};

portalsMap.on("change", (relmName: string) => {
  broadcastRemotePortalsAttendance(relmName);
});

attendance.on("change", (relmName: string) => {
  // Find all relms that depend on this attendance tally and broadcast updates
  for (let [origin, remotes] of portalsMap.portals.entries()) {
    if (remotes.has(relmName)) {
      broadcastRemotePortalsAttendance(origin);
    }
  }
});

wss.on("connection", async (conn, req, relmDoc) => {
  // Each participant connects twice, once to the "permanent" relmDoc,
  // and once to the "transient" relmDoc; we only care about tracking
  // the "permanent" one.
  if (relmDoc.docType === "permanent") {
    const relmName = relmDoc.relmName;
    const participantId = getUrlParams(req.url).get("participant-id");

    await setupWSConnection(conn, req, {
      onOpen: (doc: WSSharedDoc, isInitializingDoc: boolean) => {
        // Awareness is set first, so we have a comms line open to participants in the relm
        if (!awarenesses.has(relmName)) {
          awarenesses.set(relmName, doc.awareness);
        }

        // The portal map is loaded next, so we have access to the relm -> remote relm deps
        portalsMap.set(relmName, relmDoc.portals);

        // Then we notify that the attendance has increased in this particular relm
        attendance.join(relmName, participantId);

        broadcastRemotePortalsAttendance(relmName);

        // Finally, we lazily update any cached stats in the DB
        doc.on("update", onUpdateDoc);
      },
      onClose: (doc: WSSharedDoc) => {
        attendance.leave(relmName, participantId);

        // Clean up listener if it's the last participant to leave the room
        if (attendance.get(relmName) === 0) {
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
