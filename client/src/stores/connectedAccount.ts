import { writable, Writable } from "svelte/store";

export const connectedAccount: Writable<boolean> = writable(false);