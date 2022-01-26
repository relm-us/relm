// inspired by https://github.com/andrejewski/raj
export function runtime(program) {
  var update = program.update;
  var view = program.view;
  var done = program.done;
  var state;
  var isRunning = true;

  function dispatch(message) {
    if (isRunning) {
      change(update(message, state));
    }
  }

  function change(change) {
    state = change[0];
    var effect = change[1];
    if (effect) {
      effect(dispatch);
    }
    view(state, dispatch);
  }

  function end() {
    if (isRunning) {
      isRunning = false;
      if (done) {
        done(state);
      }
    }
  }

  change(program.init);

  return { end, dispatch, state };
}

export type Dispatch<M> = (message: M) => void;
export type Effect<M> = (dispatch: Dispatch<M>) => void | Promise<void>;

// from https://www.npmjs.com/package/raj-commands
export const Cmd = {
  none() {
    return function (_dispatch: any) {
      // does nothing;
    };
  },

  // A command that dispaches messages on demand
  ofMsg<M>(msg: M) {
    return function (dispatch: Dispatch<M>) {
      dispatch(msg);
    };
  },

  // Dispatches a message after the given ammount of milliseconds
  timeout(timeInMilliseconds, msg) {
    return function (dispatch) {
      setTimeout(function () {
        return dispatch(msg);
      }, timeInMilliseconds);
    };
  },

  batch<M>(commands: Effect<M>[]) {
    return function (dispatch) {
      for (var i = 0; i < commands.length; i++) {
        const effect = commands[i];
        if (effect) effect(dispatch);
      }
    };
  },

  mapEffect(effect, callback) {
    if (!effect) {
      return effect;
    }
    return function _mapEffect(dispatch) {
      function intercept(message) {
        dispatch(callback(message));
      }

      return effect(intercept);
    };
  },
};
