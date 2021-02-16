import { writable, Writable } from "svelte/store";

type PanelType = "collections" | "editor" | "export" | "performance";

export const openPanel: Writable<PanelType> = writable("collections");
