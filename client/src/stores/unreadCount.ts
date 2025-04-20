import { writable, type Writable } from "svelte/store"

export const unreadCount: Writable<number> = writable(0)
