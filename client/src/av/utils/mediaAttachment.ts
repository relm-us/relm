export function attach(el: HTMLAudioElement | HTMLVideoElement, mediaStreamTrack: MediaStreamTrack) {
  let mediaStream = el.srcObject
  if (!(mediaStream instanceof MediaStream)) {
    mediaStream = new MediaStream()
  }

  const getTracks = mediaStreamTrack.kind === "audio" ? "getAudioTracks" : "getVideoTracks"

  for (const track of mediaStream[getTracks]()) {
    mediaStream.removeTrack(track)
  }

  mediaStream.addTrack(mediaStreamTrack)

  el.srcObject = mediaStream
  el.autoplay = true
  if ("playsInline" in el) {
    el.playsInline = true
  }

  return el
}
