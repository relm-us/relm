import { writable, Writable } from "svelte/store";

export const autoPause: Writable<boolean> = writable(true);
