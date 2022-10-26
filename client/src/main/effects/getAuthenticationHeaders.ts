import type { PageParams } from "~/types";

import { Dispatch } from "../ProgramTypes";

import { getAuthHeaders } from "~/utils/getAuthHeaders";

export const getAuthenticationHeaders =
  (pageParams: PageParams) => async (dispatch: Dispatch) => {
    const authHeaders = await getAuthHeaders();

    if (pageParams.invitationToken) {
      authHeaders["x-relm-invite-token"] = pageParams.invitationToken;
    }

    if (pageParams.jsonWebToken) {
      authHeaders["x-relm-jwt"] = pageParams.jsonWebToken;
    }

    dispatch({
      id: "gotAuthenticationHeaders",
      authHeaders,
    });
  };
