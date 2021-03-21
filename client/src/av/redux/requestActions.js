import { nanoid } from "nanoid";
import * as stateActions from "./stateActions";

// This returns a redux-thunk action (a function).
export const notify = ({ type = "info", text, title, timeout }) => {
  if (!timeout) {
    switch (type) {
      case "info":
        timeout = 3000;
        break;
      case "error":
        timeout = 5000;
        break;
    }
  }

  const notification = {
    id: nanoid(),
    type,
    title,
    text,
    timeout,
  };

  return (dispatch) => {
    dispatch(stateActions.addNotification(notification));

    setTimeout(() => {
      dispatch(stateActions.removeNotification(notification.id));
    }, timeout);
  };
};
