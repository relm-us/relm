import { writable, Writable } from "svelte/store";

export type YLoadingState = "initial" | "loading" | "loaded";

export const yLoadingState: Writable<YLoadingState> = writable("initial");
