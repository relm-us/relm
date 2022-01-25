import { Readable } from "svelte/store";
import { storedWritable } from "~/utils/storedWritable";

// Type is `Readable` to protect from writing through any means but `dispatch`
export const audioDesired: Readable<boolean> = storedWritable("audioDesired", true);
