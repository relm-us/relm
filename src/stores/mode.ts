import { writable, Writable } from "svelte/store";

export type Mode = "build" | "play";

export const mode: Writable<Mode> = writable("play");
