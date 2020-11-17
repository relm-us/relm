import { writable, Writable } from "svelte/store";
import { Vector2 } from "three";

// Normalized mouse coordinates
export const mouse: Writable<Vector2> = writable(new Vector2());
