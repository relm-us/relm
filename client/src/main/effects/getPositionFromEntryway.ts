import { Vector3 } from "three";
import { WorldDoc } from "~/y-integration/WorldDoc";

import { Dispatch } from "../ProgramTypes";

export const getPositionFromEntryway =
  (worldDoc: WorldDoc, entryway: string) => async (dispatch: Dispatch) => {
    const entrywayUnsub = worldDoc.entryways.subscribe(($entryways) => {
      // console.log("$entryways", $entryways);
      const position = $entryways.get(entryway);
      if (position) {
        const entrywayPosition = new Vector3().fromArray(position);
        dispatch({ id: "gotPositionFromEntryway", entrywayPosition });
      }
    });
    dispatch({ id: "gotEntrywayUnsub", entrywayUnsub });
  };
