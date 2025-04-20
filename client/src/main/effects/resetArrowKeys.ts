import { keyUp, keyDown, keyLeft, keyRight } from "~/stores/keys"

import type { Dispatch } from "../ProgramTypes"

export const resetArrowKeys = (dispatch: Dispatch) => {
  keyUp.set(false)
  keyDown.set(false)
  keyLeft.set(false)
  keyRight.set(false)
}
