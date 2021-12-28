import { Writable } from "svelte/store";
import { writable } from "svelte-local-storage-store";

// Unless they say otherwise, participant will be asked to setup media (cam/mic)
export const askMediaSetup: Writable<boolean> = writable("askMediaSetup", true);
