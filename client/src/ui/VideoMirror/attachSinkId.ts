// TODO: audio output test

import { logEnabled } from "./logEnabled";

// see view-source:https://webrtc.github.io/samples/src/content/devices/multi/js/main.js

// see also https://w3c.github.io/mediacapture-output/#dom-mediadevices-selectaudiooutput

// Attach audio output device to the provided media element using the deviceId.
export function attachSinkId(element, sinkId, outputSelector) {
  if (typeof element.sinkId !== "undefined") {
    element
      .setSinkId(sinkId)
      .then(() => {
        if (logEnabled) {
          console.log(
            `Success, audio output device attached: ${sinkId} to element with ${element.title} as source.`
          );
        }
      })
      .catch((error) => {
        let errorMessage = error;
        if (error.name === "SecurityError") {
          errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
        }
        console.error(errorMessage);
        // Jump back to first output device in the list as it's the default.
        outputSelector.selectedIndex = 0;
      });
  } else {
    console.warn("Browser does not support output device selection.");
  }
}
