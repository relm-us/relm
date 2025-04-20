import { writable, type Writable } from "svelte/store"

export const needsMigration: Writable<boolean> = writable(false)
