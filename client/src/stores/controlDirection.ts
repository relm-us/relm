import { Vector2 } from "three";
import { writable, Writable } from "svelte/store";

export const controlDirection: Writable<Vector2> = writable(new Vector2());
