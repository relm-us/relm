import { writable, Writable } from "svelte/store";
import { config } from "~/config";

export const subrelm: Writable<string> = writable(config.subrelm);
export const entryway: Writable<string> = writable(config.entryway);
