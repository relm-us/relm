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

  return [dispatch, end];
}

// from https://www.npmjs.com/package/raj-commands
export const Cmd = {
  none() {
    return function (_dispatch: any) {
      // does nothing;
    };
  },

  // A command that dispaches messages on demand
  ofMsg(msg) {
    return function (dispatch) {
      dispatch(msg);
    };
  },

  // props : { value: Promise<'T>, success: 'T -> Msg, error: exception -> Msg }
  promise(props) {
    return function (dispatch) {
      return props.value
        .then(function (result) {
          return dispatch(props.resolved(result));
        })
        .catch(function (ex) {
          return dispatch(props.rejected(ex));
        });
    };
  },

  // props : { url: string, success: obj -> Msg, error: exception -> Msg }
  fetchJson(props) {
    return Cmd.promise({
      value: fetch(props.url).then(function (response) {
        return response.json();
      }),
      resolved: props.success,
      rejected: props.error,
    });
  },

  // props : { url: string, data: any success: obj -> Msg, error: exception -> Msg }
  postJson(props) {
    return Cmd.promise({
      value: fetch(props.url, {
        method: "POST",
        body: JSON.stringify(props.data),
      }).then(function (response) {
        return response.json();
      }),
      resolved: props.success,
      rejected: props.error,
    });
  },

  // Dispatches a message after the given ammount of milliseconds
  timeout(timeInMilliseconds, msg) {
    return function (dispatch) {
      setTimeout(function () {
        return dispatch(msg);
      }, timeInMilliseconds);
    };
  },

  batch(commands) {
    return function (dispatch) {
      for (var i = 0; i < commands.length; i++) {
        const effect = commands[i];
        effect(dispatch);
      }
    };
  },

  // adapted from mapEffect from raj-compose
  // https://github.com/andrejewski/raj-compose#mapeffect
  map(cmd, f) {
    return function (dispatch) {
      const outerDispatch = function (msg) {
        const transformed = f(msg);
        dispatch(transformed);
      };

      cmd(outerDispatch);
    };
  },
};
