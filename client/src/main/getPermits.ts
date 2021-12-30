import { Dispatch } from "./RelmStateAndMessage";
import { RelmRestAPI } from "~/identity/RelmRestAPI";
import { config } from "~/config";

export const getPermits = (subrelm) => async (dispatch: Dispatch) => {
  const token = new URL(window.location.href).searchParams.get("t");
  const api = new RelmRestAPI(config.serverUrl, { token });

  const permits = await api.getPermits(subrelm);
  console.log('getpermits', permits)
  dispatch({ id: "gotPermits", permits });
};