import { map } from "lib0";

import { WSSharedDoc } from "./WSSharedDoc.js";
import { docs } from "./docs.js";

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 *
 * @param {string} docname - the name of the Y.Doc to find or create
 * @param {boolean} gc - whether to allow gc on the doc (applies only when created)
 * @return {WSSharedDoc}
 */
export function getYDoc(
  docname: string,
  { gc = true, callbackHandler = null } = {}
): WSSharedDoc {
  return map.setIfUndefined(docs, docname, () => {
    const doc = new WSSharedDoc(docname, { callbackHandler });
    doc.gc = gc;
    docs.set(docname, doc);
    return doc;
  });
}
