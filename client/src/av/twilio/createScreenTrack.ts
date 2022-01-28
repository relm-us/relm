import { LocalVideoTrack } from "twilio-video";

export async function createScreenTrack(
  height = 720,
  width = 1280
): Promise<LocalVideoTrack> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getDisplayMedia
  ) {
    throw Error("getDisplayMedia is not supported");
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      height: height,
      width: width,
    },
  });

  return new LocalVideoTrack(stream.getVideoTracks()[0]);
}
