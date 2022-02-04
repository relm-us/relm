import { writable, Writable } from "svelte/store";

type PanelType =
  | "library"
  | "editor"
  | "export"
  | "performance"
  | "settings";

export const openPanel: Writable<PanelType> = writable("library");
