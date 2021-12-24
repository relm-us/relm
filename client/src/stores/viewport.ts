import { writable, Writable, derived } from "svelte/store";

export const viewport: Writable<HTMLElement> = writable(null);
