import { writable, type Writable } from "svelte/store"

export const fullscreenMeeting: Writable<boolean> = writable(false)
