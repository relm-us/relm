import { writable, Writable } from "svelte/store";

const DEFAULT_SCALE = 25.0;

export const viewportScale: Writable<number> = writable(DEFAULT_SCALE);
