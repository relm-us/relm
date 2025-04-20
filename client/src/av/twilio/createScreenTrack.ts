import { LocalVideoTrack } from "twilio-video"

export async function createScreenTrack(): Promise<LocalVideoTrack> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    throw Error("getDisplayMedia is not supported")
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    // TODO: create a merge stream so we can do karaoke :)
    audio: false,
  })

  return new LocalVideoTrack(stream.getVideoTracks()[0])
}
