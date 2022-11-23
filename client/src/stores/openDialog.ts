import { writable, Writable } from "svelte/store";
import { showCenterButtons } from "./showCenterButtons";

type DialogType =
  | "chat"
  | "pause"
  | "signin"
  | "signup"
  | "invite"
  | "language"
  | "graphics-quality"
  | "avatar-appearance"
  | "needs-migration";

export const openDialog: Writable<DialogType> = writable(null);

// Hide center buttons whenever dialog is open
openDialog.subscribe((dialog) => {
  showCenterButtons.set(dialog === null);
});
