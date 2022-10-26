import type { AuthenticationHeaders } from "relm-common";
import type { LoginManager } from "~/identity/LoginManager";
import type { RelmRestAPI } from "~/main/RelmRestAPI";

export type State = {
  authHeaders?: AuthenticationHeaders;

  screen: "error" | "initial" | "signIn" | "dashboard";
};

export type Message =
  | { id: "gotApi"; api: RelmRestAPI; loginManager: LoginManager }
  | { id: "signIn" }
  | { id: "didSignIn" }
  | { id: "other" };

export type Dispatch = (message: Message) => void;
export type Effect = (dispatch: Dispatch) => void | Promise<void>;

export type Init = [State, Effect?];
export type Update = (
  this: void,
  msg: Message,
  state: State
) => [State, Effect?];
export type View = (this: void, state: State, dispatch: Dispatch) => void;

export type Program = {
  init: Init;
  update: Update;
  view: View;
};
