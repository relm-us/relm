import type { PageParams } from "~/types";
import { AuthenticationHeaders, Security } from "relm-common";

import { Dispatch } from "../ProgramTypes";

import { participantId } from "~/identity/participantId";

export const getAuthenticationHeaders =
  (pageParams: PageParams, security: Security) => async (dispatch: Dispatch) => {
    const pubkey = await security.exportPublicKey();
    const signature = await security.sign(participantId);

    const authHeaders: AuthenticationHeaders = {
      "x-relm-participant-id": participantId,
      "x-relm-participant-sig": signature,
      "x-relm-pubkey-x": pubkey.x,
      "x-relm-pubkey-y": pubkey.y,
    };

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
