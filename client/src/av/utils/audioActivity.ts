export async function audioActivity(media: MediaStream, callback: (value: number) => void) {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(media);
  await audioContext.audioWorklet.addModule('/AudioLevelProcessor.js');
  const node = new AudioWorkletNode(audioContext, 'audio-level-processor');
  source.connect(node);
  node.port.onmessage = function (event: MessageEvent<{ volume: number }>) {
    callback(event.data.volume)
  };
  return () => {
    audioContext.close()
  }
}
