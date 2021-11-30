import {
  applyMiddleware as applyReduxMiddleware,
  createStore as createReduxStore,
} from "redux";
import thunk from "redux-thunk";
import reducers from "./redux/reducers";

import RoomClient from "./RoomClient";
import { browser } from "./browserInfo";

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
