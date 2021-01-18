import { array, map } from "svelt-yjs";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

const ydoc: Y.Doc = new Y.Doc();

const yarray: Y.Array<string> = ydoc.getArray("favorites");

const provider = new IndexeddbPersistence("relm", ydoc);

export const favorites = array.readable(yarray);
