export const supported = !!(
  window.AudioContext &&
  window.MediaStreamAudioSourceNode &&
  window.AnalyserNode &&
  window.ScriptProcessorNode
);

type Options = {
  context?: AudioContext
  get?: () => number
}

type Activity = {
  get: () => number
  destroy: () => void
}

export function audioActivity(media: MediaStream, options: Options = {}, callback: (value: number) => void): Activity {
  const context = options.context || new AudioContext();
  const source = context.createMediaStreamSource(media);
  const analyser = context.createAnalyser();
  let processor = null;

  if (callback) {
    processor = context.createScriptProcessor(2048, 1, 1);
    if (!processor) throw new Error("no processor")
    processor.onaudioprocess = function () {
      callback(get());
    };
  }

  analyser.smoothingTimeConstant = 0.3;
  analyser.fftSize = 1024;

  source.connect(analyser);

  const get = function () {
    var sum = 0;
    var data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    for (var i = 0; i < data.length; i++) {
      sum += data[i];
    }

    return sum / data.length / 255;
  };

  const destroy = function () {
    if (processor) {
      processor.disconnect();
      analyser.disconnect();
    }

    source.disconnect();

    if (!options.context) context.close();
  };

  source.connect(analyser);

  if (processor) {
    analyser.connect(processor);
    processor.connect(context.destination);
  }

  return { get, destroy };
}
