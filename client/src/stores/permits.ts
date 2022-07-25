import { writable, Writable } from "svelte/store";

export const permits: Writable<string[]> = writable([]);