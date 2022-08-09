import { writable, Writable } from "svelte/store";

export const errorCat: Writable<boolean> = writable(true);
