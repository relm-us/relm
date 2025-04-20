import { writable, type Writable } from "svelte/store"

export const highDefEnabled: Writable<boolean> = writable(false)
