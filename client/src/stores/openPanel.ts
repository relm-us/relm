import { writable, Writable } from "svelte/store";

type PanelType =
  | "add"
  | "modify"
  | "layers"
  | "export"
  | "performance"
  | "settings";

export const openPanel: Writable<PanelType> = writable("add");
