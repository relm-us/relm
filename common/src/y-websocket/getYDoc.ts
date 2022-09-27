import { map } from "lib0";

import { WSSharedDoc } from "./WSSharedDoc.js";
import { docs } from "./docs.js";

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 *
 * @param {string} docName - the name of the Y.Doc to find or create
 * @param {boolean} gc - whether to allow gc on the doc (applies only when created)
 * @return {WSSharedDoc}
 */
export function getYDoc(docName: string, gc = true): WSSharedDoc {
  return map.setIfUndefined(docs, docName, () => {
    const doc = new WSSharedDoc(docName);
    doc.gc = gc;
    docs.set(docName, doc);
    return doc;
  });
}
