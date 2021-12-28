import { RelmMessage, Dispatch } from "./RelmStateAndMessage";

// from https://www.npmjs.com/package/raj-commands

export const none = function () {
  return function (dispatch: Dispatch) {
    // does nothing;
  };
};

// A command that dispaches messages on demand
export const ofMsg = function (msg: RelmMessage) {
  return function (dispatch: Dispatch) {
    dispatch(msg);
  };
};

// props : { value: Promise<'T>, success: 'T -> Msg, error: exception -> Msg }
export const promise = function (props) {
  return function (dispatch: Dispatch) {
    return props.value
      .then(function (result) {
        return dispatch(props.resolved(result));
      })
      .catch(function (ex) {
        return dispatch(props.rejected(ex));
      });
  };
};

// props : { url: string, success: obj -> Msg, error: exception -> Msg }
export const fetchJson = function (props) {
  return promise({
    value: fetch(props.url).then(function (response) {
      return response.json();
    }),
    resolved: props.success,
    rejected: props.error,
  });
};

// props : { url: string, data: any success: obj -> Msg, error: exception -> Msg }
export const postJson = function (props) {
  return promise({
    value: fetch(props.url, {
      method: "POST",
      body: JSON.stringify(props.data),
    }).then(function (response) {
      return response.json();
    }),
    resolved: props.success,
    rejected: props.error,
  });
};

// Dispatches a message after the given ammount of milliseconds
export const timeout = function (timeInMilliseconds, msg) {
  return function (dispatch) {
    setTimeout(function () {
      return dispatch(msg);
    }, timeInMilliseconds);
  };
};

export const batch = function (commands) {
  return function (dispatch: Dispatch) {
    for (var i = 0; i < commands.length; i++) {
      const effect = commands[i];
      effect(dispatch);
    }
  };
};

// adapted from mapEffect from raj-compose
// https://github.com/andrejewski/raj-compose#mapeffect
export const map = function (cmd, f) {
  return function (dispatch: Dispatch) {
    const outerDispatch = function (msg) {
      const transformed = f(msg);
      dispatch(transformed);
    };

    cmd(outerDispatch);
  };
};
