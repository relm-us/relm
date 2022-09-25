import { getYDoc } from "relm-common";
import * as Y from "yjs";

export async function getSyncedYDoc(docId: string): Promise<Y.Doc> {
  const doc = await getYDoc(docId);
  await doc.whenSynced;
  return doc;
}
