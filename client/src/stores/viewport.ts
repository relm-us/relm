import { writable, type Writable } from "svelte/store"

export const viewport: Writable<HTMLElement> = writable(null)
