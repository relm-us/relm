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

import { get } from "svelte/store";
import { audioTrack, videoTrack } from "video-mirror";

export { default as RoomClient } from "./RoomClient";

const reduxMiddlewares = [thunk];

export const store = createReduxStore(
  reducers,
  undefined,
  applyReduxMiddleware(...reduxMiddlewares)
);
RoomClient.init({ store });

let roomClient: RoomClient;
export function connectAV({
  roomId,
  displayName,
  peerId,
  produceAudio,
  produceVideo,
}) {
  if (roomClient) roomClient.close();
  roomClient = new RoomClient({
    roomId,
    displayName,
    peerId,
    device: browser,
    produceAudio: produceAudio,
    produceVideo: produceVideo,
    consume: true,
  });

  roomClient.join();

  return roomClient;
}
