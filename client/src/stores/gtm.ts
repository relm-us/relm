import { writable, Writable } from "svelte/store";

// Google tag manager (optional)
export const gtmId: Writable<string | null> = writable(null);
