import { writable, Writable } from "svelte/store";

type PanelType =
  | "collections"
  | "editor"
  | "export"
  | "performance"
  | "settings";

export const openPanel: Writable<PanelType> = writable("collections");
