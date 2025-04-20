// inspired by https://github.com/andrejewski/raj
export function runtime(program) {
  const update = program.update
  const view = program.view
  const done = program.done
  let state
  let isRunning = true

  function dispatch(message) {
    if (isRunning) {
      change(update(message, state))
    }
  }

  function change(change) {
    state = change[0]
    const effect = change[1]
    if (effect) {
      effect(dispatch)
    }
    view(state, dispatch)
  }

  function end() {
    if (isRunning) {
      isRunning = false
      if (done) {
        done(state)
      }
    }
  }

  change(program.init)

  return { end, dispatch, state }
}

export type Dispatch<M> = (message: M) => void
export type Effect<M> = (dispatch: Dispatch<M>) => void | Promise<void>

// from https://www.npmjs.com/package/raj-commands
export const Cmd = {
  none() {
    return (_dispatch: any) => {
      // does nothing;
    }
  },

  // A command that dispaches messages on demand
  ofMsg<M>(msg: M) {
    return (dispatch: Dispatch<M>) => {
      dispatch(msg)
    }
  },

  // Dispatches a message after the given ammount of milliseconds
  timeout(timeInMilliseconds, msg) {
    return (dispatch) => {
      setTimeout(() => {
        return dispatch(msg)
      }, timeInMilliseconds)
    }
  },

  batch<M>(commands: Effect<M>[]) {
    return (dispatch) => {
      for (let i = 0; i < commands.length; i++) {
        const effect = commands[i]
        if (effect) effect(dispatch)
      }
    }
  },

  mapEffect(effect, callback) {
    if (!effect) {
      return effect
    }
    return function _mapEffect(dispatch) {
      function intercept(message) {
        dispatch(callback(message))
      }

      return effect(intercept)
    }
  },
}
