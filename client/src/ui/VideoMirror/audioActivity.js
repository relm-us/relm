export const supported = !!(
	window.AudioContext &&
	window.MediaStreamAudioSourceNode &&
	window.AnalyserNode &&
	window.ScriptProcessorNode
);

export function audioActivity(media, options, callback) {
	if (!callback) {
		callback = options;
		options = null;
	}

	options = options || {};

	var that = {};
	var context = options.context || new AudioContext();
	var source = context.createMediaStreamSource(media);
	var analyser = context.createAnalyser();
	var processor = null;

	if (callback) {
		processor = context.createScriptProcessor(2048, 1, 1);
		processor.onaudioprocess = function () {
			callback(that.get());
		};
	}

	analyser.smoothingTimeConstant = 0.3;
	analyser.fftSize = 1024;

	source.connect(analyser);

	that.get = function () {
		var sum = 0;
		var data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(data);

		for (var i = 0; i < data.length; i++) {
			sum += data[i];
		}

		return sum / data.length / 255;
	};

	that.destroy = function () {
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

	return that;
}
