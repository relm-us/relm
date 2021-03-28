import { writable, Writable } from "svelte/store";

export type WorldState = "loading" | "running" | "error";

export const worldState: Writable<WorldState> = writable("loading");
