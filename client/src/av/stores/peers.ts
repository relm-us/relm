import { writable, Writable } from "svelte/store";

export const peers: Writable<Record<string, any>> = writable({});
