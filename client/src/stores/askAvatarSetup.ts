import type { Writable } from "svelte/store"
import { storedWritable } from "~/utils/storedWritable"

// Participant will be asked to choose an avatar on first-time visit
export const askAvatarSetup: Writable<boolean> = storedWritable("askAvatarSetup", true)
