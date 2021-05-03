import { writable, Writable } from "svelte/store";

export type MediaSetupState = "setting" | "done";

// When world begins, participant is presented with a video/audio setup screen
export const mediaSetupState: Writable<MediaSetupState> = writable("setting");
