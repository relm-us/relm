import * as syncProtocol from "y-protocols/sync"
import * as awarenessProtocol from "y-protocols/awareness"

import { encoding } from "lib0"

import { send } from "./send.js"
import { closeConn } from "./closeConn.js"
import { getYDoc } from "./getYDoc.js"
import { messageListener } from "./messageListener.js"
import { messageSync, messageAwareness, pingTimeout } from "./config.js"
import type { WSSharedDoc } from "./WSSharedDoc.js"
import { docs } from "./docs.js"

/**
 * @param {any} conn
 * @param {any} req
 * @param {any} opts
 */
export async function setupWSConnection(
  conn,
  req,
  { gc = true, onOpen = null, onClose = null, docName = req.url.slice(1).split("?")[0] } = {},
): Promise<WSSharedDoc> {
  conn.binaryType = "arraybuffer"

  const isInitializingDoc = !docs.has(docName)

  // get doc, initialize if it does not exist yet
  const doc = getYDoc(docName, gc)

  doc.conns.set(conn, new Set())

  // listen and reply to events
  conn.on("message", (message: ArrayBuffer) => messageListener(conn, doc, new Uint8Array(message)))

  // Check if connection is still alive
  let pongReceived = true
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        onClose?.(doc)
        closeConn(doc, conn)
      }
      clearInterval(pingInterval)
    } else if (doc.conns.has(conn)) {
      pongReceived = false
      try {
        conn.ping()
      } catch (e) {
        onClose?.(doc)
        closeConn(doc, conn)
        clearInterval(pingInterval)
      }
    }
  }, pingTimeout)
  conn.on("close", () => {
    onClose?.(doc)
    closeConn(doc, conn)
    clearInterval(pingInterval)
  })
  conn.on("pong", () => {
    pongReceived = true
  })
  // put the following in a variables in a block so the interval handlers
  // don't keep in in scope
  {
    // await the doc state being updated from persistence, if available,
    // otherwise we may send sync step 1 too early
    if (doc.whenSynced) {
      await doc.whenSynced
    }

    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, doc)
    send(doc, conn, encoding.toUint8Array(encoder))
    const awarenessStates = doc.awareness.getStates()
    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())),
      )
      send(doc, conn, encoding.toUint8Array(encoder))
    }
  }

  onOpen?.(doc, isInitializingDoc)

  return doc
}
