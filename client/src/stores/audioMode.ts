import { writable, Writable } from "svelte/store";

export type AudioMode = "world" | "proximity";

export const audioMode: Writable<AudioMode> = writable("world");
