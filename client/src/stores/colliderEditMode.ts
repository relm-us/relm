import { writable, type Writable } from "svelte/store"

export type ColliderEditMode = "normal" | "invisible" | "ground"

// Set colliders to be visible (i.e. in build mode)
export const colliderEditMode: Writable<ColliderEditMode> = writable("normal")
