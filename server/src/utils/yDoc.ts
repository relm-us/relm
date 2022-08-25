import { map } from "lib0";
import { WSSharedDoc } from "../socket/ws.js";
import { getPersistence } from "./getPersistence.js";

const docs = new Map();

export const getYDoc = async (docname, { gc = true, callbackHandler = null, storeInCache = true } = {}): Promise<WSSharedDoc> => {
  let doc;
  
  if (storeInCache) {
    doc = map.setIfUndefined(docs, docname, () => { 
      const doc = _getYDoc(docname, { gc, callbackHandler });
      docs.set(docname, doc);
      return doc;
    });
  } else {
    doc = docs.get(docname) || _getYDoc(docname, { gc, callbackHandler });
  }
  await doc.whenSynced;

  return doc;
};

const _getYDoc = (docname, { gc = true, callbackHandler = null } = {}) => {
  const persistence = getPersistence();
  const doc = new WSSharedDoc(docname, { callbackHandler, persistence });
  doc.gc = gc;
  return doc;
};

export const removeWSYDocFromCache = docName => {
  docs.delete(docName);
};