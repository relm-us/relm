import { readableArray } from "svelt-yjs";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

const ydoc: Y.Doc = new Y.Doc();

const yMyFavs: Y.Array<string> = ydoc.getArray("my-favs");
const yRelmFavs: Y.Array<string> = ydoc.getArray("relm-favs");

const provider = new IndexeddbPersistence("relm-collections", ydoc);

export const myFavs = readableArray(yMyFavs);
export const relmFavs = readableArray(yRelmFavs);
