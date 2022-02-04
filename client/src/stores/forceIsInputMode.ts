import { writable, Writable } from "svelte/store";

export const forceIsInputMode: Writable<boolean> = writable(false);
