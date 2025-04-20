import { writable, type Writable } from "svelte/store"

export const showCenterButtons: Writable<boolean> = writable(true)
