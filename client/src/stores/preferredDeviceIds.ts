import type { Readable } from "svelte/store"
import type { DeviceIds } from "~/av/VideoMirror"
import { storedWritable } from "~/utils/storedWritable"

// Type is `Readable` to protect from writing through any means but `dispatch`
export const preferredDeviceIds: Readable<DeviceIds> = storedWritable("preferredDeviceIds", {
  audioinput: null,
  videoinput: null,
  audiooutput: null,
})
