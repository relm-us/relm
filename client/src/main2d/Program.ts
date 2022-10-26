import type { State, Message, Program, Effect } from "./ProgramTypes";

import ErrorScreen from "./views/ErrorScreen.svelte";
import BlankWithLogo from "./views/BlankWithLogo.svelte";
import Dashboard from "./views/Dashboard.svelte";
import SignInScreen from "./views/SignInScreen.svelte";

import { getApi } from "./effects/getApi";
import { checkLoggedIn } from "./effects/checkLoggedIn";

export function makeProgram(): Program {
  const init: [State, Effect] = [{ screen: "initial" }, getApi()];

  const update = (msg: Message, state: State): [State, any?] => {
    (window as any).state = state;

    if (state.screen === "error") {
      // stay in error state
      return;
    }

    // Handle Program updates
    switch (msg.id) {
      case "gotApi": {
        const newState = {
          ...state,
          api: msg.api,
          loginManager: msg.loginManager,
        };
        return [newState, checkLoggedIn(msg.api)];
      }

      case "signIn": {
        return [{ ...state, screen: "signIn" }];
      }

      case "didSignIn": {
        return [{ ...state, screen: "dashboard" }];
      }

      default:
        console.warn("Unknown relm message:", msg);
        return [state];
    }
  };

  const view = (state, dispatch) => {
    if (state)
      switch (state.screen) {
        case "initial":
          return [BlankWithLogo];

        case "error":
          return [
            ErrorScreen,
            { message: state.errorMessage || "There was an error" },
          ];

        case "signIn":
          return [SignInScreen, { api: state.api, dispatch }];

        case "dashboard":
          return [Dashboard, { api: state.api }];

        default:
          throw Error(`Unknown screen: ${state.screen}`);
      }
  };
  return { init, update, view };
}
