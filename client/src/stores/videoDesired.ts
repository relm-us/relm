import { Writable } from "svelte/store";
import { writable } from "svelte-local-storage-store";

export const videoDesired: Writable<boolean> = writable("videoDesired", true);
