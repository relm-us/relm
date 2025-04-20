import { Vector2 } from "three"
import { writable, type Writable } from "svelte/store"

export const controlDirection: Writable<Vector2> = writable(new Vector2())
