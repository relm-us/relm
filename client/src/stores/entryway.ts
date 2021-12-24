import { writable, Writable } from "svelte/store";
import { config } from "~/config";

export const entryway: Writable<string> = writable(config.entryway);
