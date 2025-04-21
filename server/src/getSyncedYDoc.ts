import { getYDoc } from "relm-common"
import type * as Y from "yjs"

export async function getSyncedYDoc(docId: string): Promise<Y.Doc> {
  const doc = getYDoc(docId)
  await doc.whenSynced
  return doc
}
