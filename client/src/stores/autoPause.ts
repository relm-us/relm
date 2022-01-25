import { Writable } from "svelte/store";
import { storedWritable } from "~/utils/storedWritable";

export const autoPause: Writable<boolean> = storedWritable("auto-pause", true);
