import { writable, Writable } from "svelte/store";

type DialogType = "pause" | "signin" | "signup";

export const openDialog: Writable<DialogType> = writable(null);

export const openDialogShown: Writable<boolean> = writable(false);
