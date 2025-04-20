import { writable, type Writable } from "svelte/store"

export const errorCat: Writable<boolean> = writable(true)
