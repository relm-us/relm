import { Writable } from "svelte/store";
import { storedWritable } from "~/utils/storedWritable";

export type DebugVisibilityState = "hidden" | "minimal" | "expanded";

export const debugMode: Writable<DebugVisibilityState> = storedWritable(
  "debugMode",
  "hidden"
);
