import { Writable } from "svelte/store";
import { storedWritable } from "~/utils/storedWritable";

export const debugMode: Writable<boolean> = storedWritable("debugMode", false);
