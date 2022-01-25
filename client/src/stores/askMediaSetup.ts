import { Writable } from "svelte/store";
import { storedWritable } from "~/utils/storedWritable";

// Unless they say otherwise, participant will be asked to setup media (cam/mic)
export const askMediaSetup: Writable<boolean> = storedWritable("askMediaSetup", true);
