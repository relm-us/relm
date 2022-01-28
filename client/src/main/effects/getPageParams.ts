import { DEFAULT_RELM_ID, DEFAULT_ENTRYWAY } from "~/config/constants";
import { canonicalIdentifier } from "~/utils/canonicalIdentifier";

import { Dispatch } from "../ProgramTypes";

export const getPageParams =
  (globalBroadcast: BroadcastChannel) => (dispatch: Dispatch) => {
    const params = new URL(window.location.href).searchParams;

    const invitationToken = params.get("t");
    const jsonWebToken = (window as any).jwt || params.get("jwt");

    const pathParts = window.location.pathname
      .split("/")
      .map((part) => (part === "" ? null : part));

    // Normally, the subrelm is specified as part of the path, e.g. "/demo", but
    // allow a `?relm=[value]` to override it.
    const relmName = params.get("relm") || pathParts[1] || DEFAULT_RELM_ID;
    const entryway = params.get("entryway") || pathParts[2] || DEFAULT_ENTRYWAY;

    // Check if we are the only tab open; prevent multiple tabs
    // from sending conflicting data re: avatar location
    globalBroadcast.onmessage = (event) => {
      if (event.data === "first?") {
        globalBroadcast.postMessage(`no`);
        // alert("Another tab of this site just got opened");
      }
      if (event.data === `no`) {
        dispatch({ id: "error", message: "Another tab or window is already open" });
        // alert("An instance of this site is already running");
      }
    };
    globalBroadcast.postMessage("first?");

    const pageParams = {
      relmName: canonicalIdentifier(relmName),
      entryway: canonicalIdentifier(entryway),
      invitationToken,
      jsonWebToken,
    };

    dispatch({ id: "gotPageParams", pageParams });
  };
