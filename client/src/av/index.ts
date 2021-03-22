import {
  applyMiddleware as applyReduxMiddleware,
  createStore as createReduxStore,
} from "redux";
import thunk from "redux-thunk";
import reducers from "./redux/reducers";

import RoomClient from "./RoomClient";

const reduxMiddlewares = [thunk];

export const store = createReduxStore(
  reducers,
  undefined,
  applyReduxMiddleware(...reduxMiddlewares)
);
RoomClient.init({ store });


