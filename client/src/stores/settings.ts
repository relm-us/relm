import { writable, Writable } from "svelte/store";

export const shadowsEnabled: Writable<boolean> = writable(true);
