import { Dispatch } from "../ProgramTypes";

import { playerId } from "~/identity/playerId";
import { Security } from "~/identity/Security";
import type { AuthenticationHeaders } from "~/identity/types";
import type { PageParams } from "~/types/PageParams";

export const getAuthenticationHeaders =
  (pageParams: PageParams) => async (dispatch: Dispatch) => {
    const security = new Security();

    const pubkey = await security.exportPublicKey();
    const signature = await security.sign(playerId);

    const authHeaders: AuthenticationHeaders = {
      "x-relm-id": playerId,
      "x-relm-s": signature,
      "x-relm-x": pubkey.x,
      "x-relm-y": pubkey.y,
    };

    if (pageParams.invitationToken) {
      authHeaders["x-relm-t"] = pageParams.invitationToken;
    }

    if (pageParams.jsonWebToken) {
      authHeaders["x-relm-jwt"] = pageParams.jsonWebToken;
    }

    dispatch({
      id: "gotAuthenticationHeaders",
      authHeaders,
    });
  };
