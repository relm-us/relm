import { writable, Writable } from "svelte-local-storage-store";

export const autoPause: Writable<boolean> = writable("auto-pause", true);
