import { writable, Writable } from "svelte/store";

export type AppState = "loading" | "running" | "error";

export const appState: Writable<AppState> = writable("loading");
