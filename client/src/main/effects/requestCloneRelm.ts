import { config } from "~/config";
import { AuthenticationHeaders, PageParams } from "~/types";
import { Dispatch } from "../ProgramTypes";
import { RelmRestAPI } from "../RelmRestAPI";

export const requestCloneRelm =
  (pageParams: PageParams, authHeaders: AuthenticationHeaders) =>
  async (dispatch: Dispatch) => {
    const api = new RelmRestAPI(
      config.serverUrl,
      pageParams.relmName,
      authHeaders
    );

    let result;
    try {
      result = await api.cloneRelm();

      const newUrl = window.location.origin + "/" + result.relmName;
      window.location.replace(newUrl);
    } catch (err) {
      return dispatch({ id: "error", message: err.message });
    }
  };
