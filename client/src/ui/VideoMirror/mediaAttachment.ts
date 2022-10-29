export function attach(el, mediaStreamTrack) {
  let mediaStream = el.srcObject;
  if (!(mediaStream instanceof MediaStream)) {
    mediaStream = new MediaStream();
  }

  const getTracks =
    mediaStreamTrack.kind === "audio" ? "getAudioTracks" : "getVideoTracks";

  mediaStream[getTracks]().forEach((track) => {
    mediaStream.removeTrack(track);
  });
  mediaStream.addTrack(mediaStreamTrack);

  el.srcObject = mediaStream;
  el.autoplay = true;
  el.playsInline = true;

  return el;
}
