import Logger from "./Logger";
import thunk from "redux-thunk";
import {
  applyMiddleware as applyReduxMiddleware,
  createStore as createReduxStore,
} from "redux";
import * as stateActions from "./redux/stateActions";
import reducers from "./redux/reducers";
import browserInfo from "./browserInfo";
import RoomClient from "./RoomClient";
import { playerId } from "~/identity/playerId";

const reduxMiddlewares = [thunk];

const store = createReduxStore(
  reducers,
  undefined,
  applyReduxMiddleware(...reduxMiddlewares)
);
RoomClient.init({ store });

const device = browserInfo();

store.dispatch(
  stateActions.setMe({
    peerId: playerId,
    displayName: playerId,
    displayNameSet: false,
    device,
  })
);

export const roomClient = new RoomClient({
  roomId: "test",
  peerId: playerId,
  displayName: playerId,
  device,
  // handlerName: handler,
  // useSimulcast,
  // useSharingSimulcast,
  // forceTcp,
  produce: true,
  consume: true,
  // forceH264,
  // forceVP9,
  // svc,
  // datachannel,
  // externalVideo,
});
