import type { WSSharedDoc } from "./WSSharedDoc.js";

import { wsReadyStateConnecting, wsReadyStateOpen } from "./config.js";

import { closeConn } from "./closeConn.js";

export function send(doc: WSSharedDoc, conn: any, message: Uint8Array) {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    closeConn(doc, conn);
  }
  try {
    conn.send(message, (err) => {
      err != null && closeConn(doc, conn);
    });
  } catch (e) {
    closeConn(doc, conn);
  }
}
