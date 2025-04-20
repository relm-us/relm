import { writable, type Writable } from "svelte/store"

export const centerCameraVisible: Writable<boolean> = writable(false)
