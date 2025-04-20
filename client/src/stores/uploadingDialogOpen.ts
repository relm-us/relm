import { writable, type Writable } from "svelte/store"

export const uploadingDialogOpen: Writable<boolean> = writable(false)
