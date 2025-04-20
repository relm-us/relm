import { globalEvents } from "~/events/globalEvents"
import { callEach } from "~/utils/callEach"
import { keyQ, keyE } from "~/stores/keys"

import { registerAction, type Action } from "../comboTable"

export function register(): Function {
  const unregisters = [
    [
      ["q"],
      (pressed) => {
        keyQ.set(pressed)
        pressed && globalEvents.emit("camera-rotate-left")
      },
    ],
    [
      ["e"],
      (pressed) => {
        keyE.set(pressed)
        pressed && globalEvents.emit("camera-rotate-right")
      },
    ],
  ].flatMap(([keys, action]: [string[], Action]) => registerAction(["play"], keys, action))

  return () => callEach(unregisters)
}
