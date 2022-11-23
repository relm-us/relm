import { writable, Writable } from "svelte/store";

export const needsMigration: Writable<boolean> = writable(false);
