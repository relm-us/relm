import { writable, type Writable } from "svelte/store";

// This device ID is set as soon as we successfully getUserMedia
export const localAudioDeviceId: Writable<string> = writable(null);