import { Writable } from "svelte/store";
import { writable } from "svelte-local-storage-store";

export const autoPause: Writable<boolean> = writable("auto-pause", true);
