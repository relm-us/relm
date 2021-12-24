import { writable, Writable } from "svelte/store";

export type LoadingState = "initial" | "loading" | "loaded" | "error";

/**
 * When a world is loading (e.g. yjs data, assets) we show a progress bar.
 * The `loadingState` is the high-level state that is set to `loading` when
 * showing that progress to the participant.
 */
export const loadingState: Writable<LoadingState> = writable("initial");
