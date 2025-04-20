import { keySpace } from "~/stores/keys"

import { globalEvents } from "~/events/globalEvents"

import { type Action, registerAction } from "../comboTable"
import { callEach } from "~/utils/callEach"

export function register(): Function {
  const unregisters = [
    [
      ["play"],
      ["space"],
      (pressed) => {
        keySpace.set(pressed)
        pressed && globalEvents.emit("action")
      },
    ],
    [
      ["build"],
      ["space"],
      (pressed) => {
        keySpace.set(pressed)
      },
    ],
  ].flatMap(([contexts, keys, action]: [string[], string[], Action]) => registerAction(contexts, keys, action))

  return () => callEach(unregisters)
}
