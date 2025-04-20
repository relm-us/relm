import { Vector3 } from "three"
import type { WorldDoc } from "~/y-integration/WorldDoc"

import type { Dispatch } from "../ProgramTypes"

export const getPositionFromEntryway = (worldDoc: WorldDoc, entryway: string) => async (dispatch: Dispatch) => {
  const entrywayUnsub = worldDoc.entryways.subscribe(($entryways) => {
    if (!$entryways.has(entryway)) entryway = "default"
    const position = $entryways.get(entryway)
    if (position) {
      const entrywayPosition = new Vector3().fromArray(position)
      dispatch({ id: "gotPositionFromEntryway", entryway, entrywayPosition })
    }
  })
  dispatch({ id: "gotEntrywayUnsub", entrywayUnsub })
}
