import { writable, Writable } from "svelte/store";

export type WorldState = "loading" | "running" | "paused";

export const worldState: Writable<WorldState> = writable("loading");
