import { writable, type Writable } from "svelte/store"

export const shadowsEnabled: Writable<boolean> = writable(false)
