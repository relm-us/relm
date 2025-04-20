import { globalEvents } from "~/events/globalEvents"
import { registerAction } from "../comboTable"

export function register(): Function {
  return registerAction(["play", "build"], ["b"], (pressed, options) => {
    pressed && globalEvents.emit("switch-mode")
  })
}
