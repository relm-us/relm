import { writable, Writable } from "svelte/store";

export const buildModeAllowed: Writable<boolean> = writable(false);
