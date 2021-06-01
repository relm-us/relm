import { get, writable, Writable } from "svelte/store";
import { askMediaSetup } from "./askMediaSetup";
import { askAvatarSetup } from "./askAvatarSetup";

export type SetupState = "media" | "avatar" | "done";

function defaultSetupState() {
  if (get(askMediaSetup)) return "media";
  else if (get(askAvatarSetup)) return "avatar";
  else return "done";
}

/**
 * When world begins, participant may be presented with these setup screens:
 * - a video/audio setup screen
 * - an avatar selection screen
 * 
 * These setup screens can be skipped at subsequent visits if
 * askMediaSetup or askAvatarSetup are false.
 */
export const setupState: Writable<SetupState> = writable(defaultSetupState());
