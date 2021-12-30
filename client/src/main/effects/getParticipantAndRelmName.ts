import { playerId } from "~/identity/playerId";
import { getSecureParams } from "~/identity/secureParams";
import { DEFAULT_RELM_ID, DEFAULT_ENTRYWAY } from "~/config/constants";
import { canonicalIdentifier } from "~/utils/canonicalIdentifier";

import { Dispatch } from "../RelmStateAndMessage";

export function getRelmAndEntryway(): { relmName: string; entryway: string } {
  const params = new URLSearchParams(window.location.search.substring(1));

  const pathParts = window.location.pathname
    .split("/")
    .map((part) => (part === "" ? null : part));

  // Normally, the subrelm is specified as part of the path, e.g. "/demo", but
  // allow a `?relm=[value]` to override it.
  const relmName = params.get("relm") || pathParts[1] || DEFAULT_RELM_ID;
  const entryway = params.get("entryway") || pathParts[2] || DEFAULT_ENTRYWAY;

  return {
    relmName: canonicalIdentifier(relmName),
    entryway: canonicalIdentifier(entryway),
  };
}

export async function getParticipantAndRelm(dispatch: Dispatch) {
  const { relmName, entryway } = getRelmAndEntryway();
  dispatch({
    id: "gotParticipantAndRelm",
    participantId: playerId,
    secureParams: await getSecureParams(window.location.href),
    relmName,
    entryway,
  });
}
