import { writable, Writable } from "svelte/store";

export const copyBuffer: Writable<Array<string>> = writable([]);
