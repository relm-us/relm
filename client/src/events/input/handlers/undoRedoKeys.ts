import { globalEvents } from "~/events/globalEvents"
import { callEach } from "~/utils/callEach"
import { type Action, registerAction } from "../comboTable"

export function register() {
  const unregisters = [
    [
      ["C z", "M z"],
      (pressed) => {
        pressed && globalEvents.emit("undo")
      },
    ],
    [
      ["C y", "S-M z", "S-C z"],
      (pressed) => {
        pressed && globalEvents.emit("redo")
      },
    ],
  ].flatMap(([keys, action]: [string[], Action]) => registerAction(["build"], keys, action))

  return () => callEach(unregisters)
}
