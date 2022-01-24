import { writable, Writable } from "svelte/store";

export const targetFps: Writable<number> = writable(60);
