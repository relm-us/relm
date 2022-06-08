import { DEFAULT_RELM_NAME, DEFAULT_ENTRYWAY } from "~/config/constants";
import { canonicalIdentifier } from "relm-common";

import { Dispatch } from "../ProgramTypes";

export const getPageParams =
  (globalBroadcast: BroadcastChannel) => (dispatch: Dispatch) => {
    const params = new URL(window.location.href).searchParams;
    const hash = window.location.hash.replace("#", "");

    const invitationToken = params.get("t");
    const jsonWebToken = (window as any).jwt || params.get("jwt");

    const entryway = hash === "" ? DEFAULT_ENTRYWAY : canonicalIdentifier(hash);

    const path = window.location.pathname.replace(/^\/|\/$/g, "");

    let relmName;
    let isCloneRequest;

    // Request to clone base relm?
    const match = path.match(/^([^/]+)\/new$/);
    if (match) {
      relmName = match[1];
      isCloneRequest = true;
    } else {
      // Nope, just a regular relm
      relmName = path === "" ? DEFAULT_RELM_NAME : path;
      isCloneRequest = false;
    }

    // Safari doesn't support BroadcastChannel, so globalBroadcast may be null
    if (globalBroadcast) {
      // Check if we are the only tab open; prevent multiple tabs
      // from sending conflicting data re: avatar location
      globalBroadcast.onmessage = (event) => {
        if (event.data === relmName) {
          globalBroadcast.postMessage(`no`);
        }
        if (event.data === `no`) {
          dispatch({
            id: "error",
            message: "Another tab or window is already open",
          });
        }
      };
      globalBroadcast.postMessage(relmName);
    }

    const pageParams = {
      relmName,
      entryway,
      isCloneRequest,
      invitationToken,
      jsonWebToken,
    };

    dispatch({ id: "gotPageParams", pageParams });
  };
