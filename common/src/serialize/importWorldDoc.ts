import type * as Y from "yjs"
import { deltaToYText, jsonToYEntity, type YEntity } from "../yrelm/index.js"
import type { MinimalRelmJSON } from "./types.js"

export function importEntities(entities: any[], dest: Y.Doc) {
  const yentities = dest.getArray("entities") as Y.Array<YEntity>
  // Y.Array#push takes many items, unlike regular Array#push
  yentities.push(entities.map((e) => jsonToYEntity(e)))
}

export function importNonEntities(source: MinimalRelmJSON, dest: Y.Doc) {
  const yentryways = dest.getMap("entryways") as Y.Map<Array<number>>
  for (const [name, coords] of Object.entries(source.entryways)) {
    yentryways.set(name, coords)
  }

  const ysettings = dest.getMap("settings") as Y.Map<Array<any>>
  for (const [name, value] of Object.entries(source.settings)) {
    ysettings.set(name, value)
  }

  const ydocuments = dest.getMap("documents") as Y.Map<Y.Text>
  for (const [name, value] of Object.entries(source.documents)) {
    ydocuments.set(name, deltaToYText(value))
  }
}

export function importWorldDoc(source: MinimalRelmJSON, dest: Y.Doc) {
  importEntities(source.entities, dest)
  importNonEntities(source, dest)
}
