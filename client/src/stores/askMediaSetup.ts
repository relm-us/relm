import { writable, Writable } from "svelte/store";
import { storedWritable } from "~/utils/storedWritable";
import { AV_ENABLED } from "~/config/constants";

// Unless they say otherwise, participant will be asked to setup media (cam/mic)
export const askMediaSetup: Writable<boolean> = AV_ENABLED
  ? storedWritable("askMediaSetup", true)
  : writable(false);
