import { writable, type Writable } from "svelte/store"

export const connectedAccount: Writable<boolean> = writable(false)
