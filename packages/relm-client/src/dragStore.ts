import { writable, Writable } from "svelte/store";

export type DragInfo = {
  id: string;
  category: string;
};

export const dragSource: Writable<DragInfo> = writable(null);
export const dragDest: Writable<DragInfo> = writable(null);
