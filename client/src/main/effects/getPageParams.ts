import { DEFAULT_RELM_ID, DEFAULT_ENTRYWAY } from "~/config/constants";
import { canonicalIdentifier } from "~/utils/canonicalIdentifier";

import { Dispatch } from "../ProgramTypes";

export async function getPageParams(dispatch: Dispatch) {
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

  const pageParams = {
    relmName: canonicalIdentifier(relmName),
    entryway: canonicalIdentifier(entryway),
    invitationToken,
    jsonWebToken,
  };

  dispatch({ id: "gotPageParams", pageParams });
}
