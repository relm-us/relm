import type { Dispatch } from "../ProgramTypes";

import { toast } from "@zerodevx/svelte-toast";

import { config } from "~/config";
import { getAuthHeaders } from "~/utils/getAuthHeaders";
import { RelmRestAPI } from "~/main/RelmRestAPI";
import { LoginManager } from "~/identity/LoginManager";

export const getApi = () => async (dispatch: Dispatch) => {
  const authHeaders = await getAuthHeaders();

  const api = new RelmRestAPI(config.serverUrl, authHeaders);
  // if (pageParams.invitationToken) {
  //   authHeaders["x-relm-invite-token"] = pageParams.invitationToken;
  // }

  const loginManager = new LoginManager(api, {
    notify: (text: string) => toast.push(text),
  });

  dispatch({
    id: "gotApi",
    api,
    loginManager,
  });
};
