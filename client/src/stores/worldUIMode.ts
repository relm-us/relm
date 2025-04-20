import { writable, type Writable } from "svelte/store"

export type WorldUIMode = "build" | "play"

export const worldUIMode: Writable<WorldUIMode> = writable("play")
