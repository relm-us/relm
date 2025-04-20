import { writable, type Writable } from "svelte/store"

// First element to get tab focus registers itself in this store
export const firstFocusElement: Writable<HTMLElement> = writable(null)
