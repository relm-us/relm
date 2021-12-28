import { getSubrelmAndEntryway } from "~/config";
import { Dispatch } from "./RelmStateAndMessage";

export async function locateSubrelm(dispatch: Dispatch) {
  const { initialSubrelm, entryway } = getSubrelmAndEntryway(window.location);
  console.log("subrelm and entryway", initialSubrelm, entryway);
  dispatch({ id: "gotSubrelm", subrelm: initialSubrelm, entryway });
}
