import { map } from "lib0";
import { GeckoSharedDoc } from "../socket/GeckoSharedDoc.js";
import { WSSharedDoc } from "../socket/ws.js";
import { getPersistence } from "./getPersistence.js";

const wsDocs = new Map();
const geckoDocs = new Map();

export const getWSYDoc = async (docname, { gc = true, callbackHandler = null, storeInCache = true } = {}): Promise<WSSharedDoc> => {
  let doc;
  
  if (storeInCache) {
    doc = map.setIfUndefined(wsDocs, docname, () => _getWSYDoc(docname, { gc, callbackHandler }));
  } else {
    doc = _getWSYDoc(docname, { gc, callbackHandler });
  }
  await doc.whenSynced;

  return doc;
};

const _getWSYDoc = (docname, { gc = true, callbackHandler = null } = {}) => {
  const persistence = getPersistence();
  const doc = new WSSharedDoc(docname, { callbackHandler, persistence });
  doc.gc = gc;
  wsDocs.set(docname, doc);
  return doc;
};

export const getGeckoYDoc = async (docname, { gc = true, callbackHandler = null, storeInCache = true } = {}): Promise<GeckoSharedDoc> => {
  let doc;
  
  if (storeInCache) {
    doc = map.setIfUndefined(wsDocs, docname, () => _getGeckoYDoc(`${docname}/gecko`, { gc, callbackHandler }));
  } else {
    doc = _getGeckoYDoc(`${docname}/gecko`, { gc, callbackHandler });
  }
  await doc.whenSynced;

  return doc;
};

const _getGeckoYDoc = (docname, { gc = true, callbackHandler = null } = {}) => {
  const doc = new GeckoSharedDoc(docname, { callbackHandler });
  doc.gc = gc;
  geckoDocs.set(docname, doc);
  return doc;
};

export const removeWSYDocFromCache = docName => wsDocs.delete(docName);
export const removeGeckoYDocFromCache = docName => geckoDocs.delete(docName);