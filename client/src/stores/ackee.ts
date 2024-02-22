import { writable, Writable } from "svelte/store";

export const ackeeID: Writable<string | null> = writable(null);
