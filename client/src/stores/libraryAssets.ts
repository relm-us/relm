import type { LibraryAsset } from "~/types";

import { writable, derived, Readable, Writable } from "svelte/store";

import { worldManager } from "~/world";
import { CancellablePromise } from "real-cancellable-promise";

export type LibraryFetch =
  | { type: "init" }
  | { type: "fetching" }
  | { type: "success"; assets: LibraryAsset[] }
  | { type: "error"; message: string };

export const librarySearch: Writable<string> = writable(null);
export const libraryPage: Writable<number> = writable(0);

const isTag = (booleanValue: boolean) => (term) => {
  return term.startsWith("#") === booleanValue;
};

let lastQueryHash = null;
let promise: CancellablePromise<LibraryAsset[]>;
export const libraryAssets: Readable<LibraryFetch> = derived(
  [librarySearch, libraryPage],
  ([search, page], set) => {
    const queryHash = `${search}/${page}`;
    console.log("queryHash", queryHash, lastQueryHash);
    if (lastQueryHash === queryHash) return;
    lastQueryHash = queryHash;

    const terms = search ? search.trim().split(/\s+/) : [];
    const tags = terms.filter(isTag(true)).map((tag) => tag.slice(1));
    const keywords = terms.filter(isTag(false));
    if (promise) promise.cancel();
    set({ type: "fetching" });
    promise = worldManager.api.queryAssets({
      keywords,
      tags,
      page,
    });
    promise
      .then((assets) => {
        set({ type: "success", assets });
      })
      .catch((err) => {
        set({ type: "error", message: err.toString() });
      });
  },
  { type: "init" } as LibraryFetch
);
