import { writable, Writable } from "svelte/store";

export const worldRunning: Writable<boolean> = writable(false);
