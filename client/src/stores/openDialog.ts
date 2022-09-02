import { writable, Writable } from "svelte/store";
import { showCenterButtons } from "./showCenterButtons";

type DialogType = "pause" | "signin" | "signup";

export const openDialog: Writable<DialogType> = writable(null);

// Hide center buttons whenever dialog is open
openDialog.subscribe((dialog) => {
  showCenterButtons.set(dialog === null);
});
