import { globalEvents } from "~/events/globalEvents"
import { registerAction } from "../comboTable"

export function register(): Function {
  return registerAction(["build"], ["backspace", "delete"], (pressed) => {
    pressed && globalEvents.emit("delete")
  })
}
