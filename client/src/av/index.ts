import {
  applyMiddleware as applyReduxMiddleware,
  createStore as createReduxStore,
} from "redux";
import thunk from "redux-thunk";
import reducers from "./redux/reducers";
import { types } from "mediasoup-client";

import RoomClient from "./RoomClient";
import { browser } from "~/av/browserInfo";

import { roomConnectState } from "~/av/stores/roomConnectState";
import { producers } from "~/av/stores/producers";

import { get, derived } from "svelte/store";
import { audioRequested, videoRequested } from "video-mirror";

const reduxMiddlewares = [thunk];

export const store = createReduxStore(
  reducers,
  undefined,
  applyReduxMiddleware(...reduxMiddlewares)
);
RoomClient.init({ store });

let roomClient: RoomClient;

/**
 * We bring the video-mirror state and the mediasoup state together here:
 * - when the 'audio' option is disabled in video-mirror, the participant
 *   should enter the room muted.
 */
derived(
  [roomConnectState, producers, audioRequested, videoRequested],
  ([$state, $producers, $audioReq, $videoReq], set) => {
    const needsMuteProducers = [];
    const request = {
      audio: $audioReq,
      video: $videoReq,
    };

    if ($state === "connected") {
      for (const kind of ["audio", "video"]) {
        if (request[kind] === false) {
          const producer = Object.values($producers).find(
            (producer) => producer.track && producer.track.kind === kind
          );
          if (producer && !producer.paused) {
            needsMuteProducers.push(producer);
          }
        }
      }
    }

    if (needsMuteProducers.length) {
      set(needsMuteProducers);
    }
  }
).subscribe((producers: Array<types.Producer>) => {
  if (!producers) return;
  for (const producer of producers) {
    if (producer.track && producer.track.kind === "audio") {
      roomClient.muteMic();
    }
  }
});

export function connectAV({ roomId, displayName, peerId }) {
  if (roomClient) roomClient.close();
  roomClient = new RoomClient({
    roomId,
    displayName,
    peerId,
    device: browser,
    produce: get(audioRequested) || get(videoRequested),
    consume: true,
  });

  roomClient.join();

  return roomClient;
}
