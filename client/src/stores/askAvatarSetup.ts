import { Writable } from "svelte/store";
import { writable } from "svelte-local-storage-store";

// Participant will be asked to choose an avatar on first-time visit
export const askAvatarSetup: Writable<boolean> = writable(
  "askAvatarSetup",
  true
);
