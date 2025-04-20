import { worldManager } from "~/world"
import { registerAction } from "../comboTable"

export function register(): Function {
  return registerAction(["play", "build"], ["p"], (pressed) => {
    pressed && worldManager.togglePaused()
  })
}
