import { writable, Writable } from "svelte/store";

export type PlayState = "playing" | "paused"

export const playState: Writable<PlayState> = writable("playing");
