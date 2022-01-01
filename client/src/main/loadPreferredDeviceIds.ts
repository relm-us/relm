import { DeviceIds } from "video-mirror";

export function loadPreferredDeviceIds(): DeviceIds {
  try {
    const storedDeviceIds = JSON.parse(
      localStorage.getItem("preferredDeviceIds")
    );
    if (storedDeviceIds) {
      return {
        audioinput: storedDeviceIds.audioinput,
        audiooutput: storedDeviceIds.audiooutput,
        videoinput: storedDeviceIds.videoinput,
      };
    }
  } catch (err) {}
  return {
    audioinput: null,
    audiooutput: null,
    videoinput: null,
  };
}
