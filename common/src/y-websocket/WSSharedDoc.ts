import * as Y from "yjs"
import * as awarenessProtocol from "y-protocols/awareness"
import * as syncProtocol from "y-protocols/sync"
import { encoding, mutex } from "lib0"

import { getPersistence } from "./persistence.js"
import { send } from "./send.js"
import { GC_ENABLED, messageAwareness, messageSync } from "./config.js"

export class WSSharedDoc extends Y.Doc {
  name: string
  mux: any
  conns: Map<Object, Set<number>>
  awareness: awarenessProtocol.Awareness
  whenSynced: Promise<void>
  isSynced: boolean

  /**
   * @param {string} name
   */
  constructor(name) {
    super({ gc: GC_ENABLED })
    this.name = name
    this.mux = mutex.createMutex()

    // Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
    this.conns = new Map()
    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)
    this.whenSynced = void 0
    this.isSynced = false

    /**
     * @param changes Added, updated, or removed clients
     * @param conn Origin is the connection that made the change
     */
    const awarenessChangeHandler = (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      conn: Object,
    ) => {
      const changedClients = added.concat(updated, removed)
      if (conn !== null) {
        const connControlledIDs: Set<number> = this.conns.get(conn)
        if (connControlledIDs !== undefined) {
          added.forEach((clientID) => {
            connControlledIDs.add(clientID)
          })
          removed.forEach((clientID) => {
            connControlledIDs.delete(clientID)
          })
        }
      }
      // broadcast awareness update
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients))
      const buff = encoding.toUint8Array(encoder)
      this.conns.forEach((_, c) => {
        send(this, c, buff)
      })
    }
    this.awareness.on("update", awarenessChangeHandler)

    this.on("update", (update: Uint8Array, origin: any, doc: WSSharedDoc) => {
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageSync)
      syncProtocol.writeUpdate(encoder, update)
      const message = encoding.toUint8Array(encoder)
      doc.conns.forEach((_, conn) => send(doc, conn, message))
    })

    const persistence = getPersistence()

    if (persistence !== null) {
      this.whenSynced = persistence.bindState(name, this).then(() => {
        this.isSynced = true
      })
    }
  }
}
