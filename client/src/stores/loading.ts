import { get, writable, Writable } from "svelte/store";

type State = "init" | "loading-metadata" | "loading-assets" | "done";

/**
 * loading is a sub-state of worldState, i.e. when worldState is 'loading'
 * we have more detail here in these stores that can be used to show a progress
 * bar.
 */

export const loading: Writable<State> = writable("init");
export const loaded: Writable<number> = writable(0);
export const maximum: Writable<number> = writable(100);

export function resetLoading() {
  loading.set("init");
  loaded.set(0);
  maximum.set(100);
}

export function setLoading(newState: State) {
  const $loading = get(loading);
  if ($loading !== newState) {
    loading.set(newState);
  }
}
