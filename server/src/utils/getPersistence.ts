import { LeveldbPersistence } from "y-leveldb";
import { YPERSISTENCE } from "../config.js";
import * as Y from "yjs";

let persistence = null;
if (typeof YPERSISTENCE === "string") {
  console.info('Persisting documents to "' + YPERSISTENCE + '"');
  // @ts-ignore
  const ldb = new LeveldbPersistence(YPERSISTENCE);
  persistence = {
    provider: ldb,
    bindState: async (docName, ydoc) => {
      const persistedYdoc = await ldb.getYDoc(docName);
      const newUpdates = Y.encodeStateAsUpdate(ydoc);
      ldb.storeUpdate(docName, newUpdates);
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
      ydoc.on("update", (update) => {
        ldb.storeUpdate(docName, update);
      });
    }
  };
} else {
  console.warn("Missing YPERSISTENCE environment variable. relm ydoc data will NOT be saved.");
}

export const getPersistence = () => persistence;