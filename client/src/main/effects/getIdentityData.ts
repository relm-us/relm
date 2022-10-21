import { AuthenticationHeaders } from "~/../../common/dist";
import { PageParams } from "~/types";
import { Dispatch } from "../ProgramTypes";
import { RelmRestAPI } from "../RelmRestAPI";

import { config } from "~/config";

export const getIdentityData =
  (pageParams: PageParams, authHeaders: AuthenticationHeaders) =>
  async (dispatch: Dispatch) => {
    const api = new RelmRestAPI(
      config.serverUrl,
      authHeaders,
      pageParams.relmName
    );

    const { identity, isConnected } = await api.getIdentityData();
    dispatch({
      id: "gotIdentityData",
      identity,
      isConnected,
    });
  };
