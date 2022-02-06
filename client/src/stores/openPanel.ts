import { writable, Writable } from "svelte/store";

type PanelType =
  | "add"
  | "modify"
  | "actions"
  | "export"
  | "performance"
  | "settings";

export const openPanel: Writable<PanelType> = writable("add");
