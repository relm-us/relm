import { Readable } from "svelte/store";
import { DeviceIds } from "video-mirror";
import { storedWritable } from "~/utils/storedWritable";

// Type is `Readable` to protect from writing through any means but `dispatch`
export const preferredDeviceIds: Readable<DeviceIds> = storedWritable(
  "preferredDeviceIds",
  {
    audioinput: null,
    videoinput: null,
    audiooutput: null,
  }
);
