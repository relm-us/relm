import * as awarenessProtocol from "y-protocols/awareness"

import { getPersistence } from "./persistence.js"
import { docs } from "./docs.js"
import type { WSSharedDoc } from "./WSSharedDoc.js"

export const closeConn = (doc: WSSharedDoc, conn) => {
  if (doc.conns.has(conn)) {
    const controlledIds: Set<number> = doc.conns.get(conn)
    doc.conns.delete(conn)
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null)
    const persistence = getPersistence()

    if (doc.conns.size === 0 && persistence !== null) {
      if (doc.isSynced) {
        // if persisted and the state has finished loading from the database,
        // we write the state back to persisted storage
        persistence.writeState(doc.name, doc).then(() => {
          // Destroy emitters/listeners
          doc.destroy()
        })
      }
      docs.delete(doc.name)
    }
  }
  conn.close()
}
