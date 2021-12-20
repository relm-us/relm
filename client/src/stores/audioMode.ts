import { writable, Writable } from "svelte/store";

export type Mode = "world" | "proximity";

export const audioMode: Writable<Mode> = writable("world");
