import { keyUp, keyDown, keyLeft, keyRight } from "~/stores/keys"
import { callEach } from "~/utils/callEach"

import { type Action, registerAction } from "../comboTable"

export function register(): Function {
  const unregisters = [
    [["arrowup", "w"], (pressed: boolean) => keyUp.set(pressed)],
    [["arrowdown", "s"], (pressed: boolean) => keyDown.set(pressed)],
    [["arrowleft", "a"], (pressed: boolean) => keyLeft.set(pressed)],
    [["arrowright", "d"], (pressed: boolean) => keyRight.set(pressed)],
  ].flatMap(([keys, action]: [string[], Action]) => registerAction(["play", "build"], keys, action))
  return () => callEach(unregisters)
}
