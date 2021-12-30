import { Writable } from "svelte/store";
import { writable } from "svelte-local-storage-store";

export const audioDesired: Writable<boolean> = writable("audioDesired", true);
