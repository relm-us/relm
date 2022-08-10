import { map } from "lib0";

import { WSSharedDoc } from "../ws/WSSharedDoc.js";
import { getPersistence } from "./getPersistence.js";

const docs = new Map();

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 *
 * @param {string} docname - the name of the Y.Doc to find or create
 * @param {boolean} gc - whether to allow gc on the doc (applies only when created)
 * @return {WSSharedDoc}
 */
export const getYDoc = async (docname, { gc = true, callbackHandler = null } = {}): Promise<WSSharedDoc> => {
  const persistence = getPersistence();
  const doc = map.setIfUndefined(docs, docname, () => {
    const doc = new WSSharedDoc(docname, { callbackHandler, persistence });
    doc.gc = gc;
    docs.set(docname, doc);
    return doc;
  });
  await doc.whenSynced;

  return doc;
};