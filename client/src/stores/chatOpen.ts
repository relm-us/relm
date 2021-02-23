import { writable, Writable } from "svelte/store";

export const chatOpen: Writable<boolean> = writable(false);
export const chatFocused: Writable<boolean> = writable(false);
