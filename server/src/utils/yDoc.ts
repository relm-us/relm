import { map } from "lib0";
import { GeckoSharedDoc } from "../socket/gecko.js";
import { WSSharedDoc } from "../socket/ws.js";
import { getPersistence } from "./getPersistence.js";

const wsDocs = new Map();
const geckoDocs = new Map();

export const getWSYDoc = async (docname, { gc = true, callbackHandler = null, storeInCache = true } = {}): Promise<WSSharedDoc> => {
  let doc;
  
  if (storeInCache) {
    console.log("trying cache");
    doc = map.setIfUndefined(wsDocs, docname, () => { 
      const doc = _getWSYDoc(docname, { gc, callbackHandler });
      wsDocs.set(docname, doc);
      return doc;
    });
  } else {
    doc = wsDocs.get(docname) || _getWSYDoc(docname, { gc, callbackHandler });
  }
  await doc.whenSynced;

  return doc;
};

const _getWSYDoc = (docname, { gc = true, callbackHandler = null } = {}) => {
  const persistence = getPersistence();
  const doc = new WSSharedDoc(docname, { callbackHandler, persistence });
  doc.gc = gc;
  return doc;
};

export const getGeckoYDoc = async (docname, { gc = true, callbackHandler = null, storeInCache = true } = {}): Promise<GeckoSharedDoc> => {
  let doc;
  
  if (storeInCache) {
    doc = map.setIfUndefined(geckoDocs, docname, () => {
      const doc = _getGeckoYDoc(`${docname}/gecko`, { gc, callbackHandler });
      geckoDocs.set(`${docname}/gecko`, doc);
      return doc;
    });
  } else {
    doc = geckoDocs.get(`${docname}/gecko`) || _getGeckoYDoc(`${docname}/gecko`, { gc, callbackHandler });
  }
  await doc.whenSynced;

  return doc;
};

const _getGeckoYDoc = (docname, { gc = true, callbackHandler = null } = {}) => {
  const doc = new GeckoSharedDoc(docname, { callbackHandler });
  doc.gc = gc;
  return doc;
};

export const removeWSYDocFromCache = docName => {
  wsDocs.delete(docName);
};
export const removeGeckoYDocFromCache = docName => geckoDocs.delete(docName);