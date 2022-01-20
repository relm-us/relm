import { Writable } from "svelte/store";
import { writable } from "svelte-local-storage-store";

export const debugMode: Writable<boolean> = writable("debugMode", false);
