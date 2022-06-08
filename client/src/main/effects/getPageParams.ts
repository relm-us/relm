import { DEFAULT_RELM_NAME, DEFAULT_ENTRYWAY } from "~/config/constants";
import { canonicalIdentifier } from "relm-common";
import { removeLeading } from "~/utils/removeLeading";

import { Dispatch } from "../ProgramTypes";

export const getPageParams =
  (globalBroadcast: BroadcastChannel) => (dispatch: Dispatch) => {
    const params = new URL(window.location.href).searchParams;
    const hash = window.location.hash.replace("#", "");

    const invitationToken = params.get("t");
    const jsonWebToken = (window as any).jwt || params.get("jwt");

    let relmName = removeLeading(window.location.pathname, "/")
      .split("/")
      .map((part) => canonicalIdentifier(part))
      .join("/");
    if (relmName === "") relmName = DEFAULT_RELM_NAME;

    const entryway = hash === "" ? DEFAULT_ENTRYWAY : canonicalIdentifier(hash);

    // TODO: The "new" keyword is a special instance that means to clone the base
    // relm to create a new instance.
    // if (relmInstance === "new") {
    // }

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
      invitationToken,
      jsonWebToken,
    };

    console.log("pageParams", pageParams);

    dispatch({ id: "gotPageParams", pageParams });
  };
