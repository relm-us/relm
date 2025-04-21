import type * as Y from "yjs"
import { PROTECTED_WORLD_DOC_KEYS } from "../constants.js"
import { yEntityToJSON, type YEntity, yTextToDelta } from "../yrelm/index.js"
import type { MinimalRelmJSON } from "./types.js"

export function exportWorldDoc(ydoc: Y.Doc, ids?: Set<string>): MinimalRelmJSON {
  const yentities = ydoc.getArray("entities") as Y.Array<YEntity>
  const entities = []
  for (const entity of yentities) {
    const id = entity.get("id") as string
    if (!ids || ids?.has(id)) {
      entities.push(yEntityToJSON(entity))
    }
  }

  const yentryways = ydoc.getMap("entryways") as Y.Map<Array<number>>
  const entryways = {}
  for (const [name, coords] of [...yentryways]) {
    entryways[name] = coords
  }

  const ysettings = ydoc.getMap("settings") as Y.Map<any>
  const settings = {}
  for (const [name, value] of [...ysettings]) {
    settings[name] = value
  }

  const ydocuments = ydoc.getMap("documents") as Y.Map<any>
  const documents = {}
  for (const [name, value] of [...ydocuments]) {
    documents[name] = yTextToDelta(value)
  }

  // export deprecated documents
  for (const docId of ydoc.share.keys()) {
    if (
      // make sure we don't try to use non-Document things from Y.Doc keys
      !PROTECTED_WORLD_DOC_KEYS.includes(docId) &&
      // make sure we don't overwrite new Document with deprecated
      !documents[docId]
    ) {
      const value = ydoc.getText(docId)
      documents[docId] = yTextToDelta(value)
    }
  }

  return { entities, entryways, settings, documents }
}
