import type { WSSharedDoc } from "./WSSharedDoc.js"

import * as Y from "yjs"
import { LeveldbPersistence } from "y-leveldb"

import { getEnv } from "./config.js"

type StateBinder = (string: string, doc: WSSharedDoc) => Promise<void>
type StateWriter = (string: string, doc: WSSharedDoc) => Promise<any>

export type Persistence = {
  bindState: StateBinder
  writeState: StateWriter
  provider: any
}

let persistence: Persistence = null

export function setPersistence(persistence_) {
  persistence = persistence_
}

export function getPersistence() {
  return persistence
}

const persistenceDir = getEnv("YPERSISTENCE")
if (typeof persistenceDir === "string") {
  console.info(`Persisting documents to "${persistenceDir}"`)
  const ldb = new LeveldbPersistence(persistenceDir)
  setPersistence({
    provider: ldb,
    bindState: async (docName, ydoc) => {
      if (!docName) {
        throw new Error("docName (relm) is required for persistence")
      }
      const persistedYdoc = await ldb.getYDoc(docName)
      const newUpdates = Y.encodeStateAsUpdate(ydoc)
      ldb.storeUpdate(docName, newUpdates)
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
      ydoc.on("update", (update) => {
        ldb.storeUpdate(docName, update)
      })
    },
    writeState: async (docName, ydoc) => {},
  })
} else if (globalThis["global"]) {
  // If running in node.js, `global` will exist.
  console.warn("Missing YPERSISTENCE environment variable. y-websocket data will NOT be saved.")
}
