import { writable, Writable } from "svelte/store";

export type DragAction = "pan" | "rotate";

export const dragAction: Writable<DragAction> = writable("pan");
