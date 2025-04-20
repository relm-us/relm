import { debugMode } from "~/stores/debugMode"
import { registerAction } from "../comboTable"

export function register(): Function {
  return registerAction(["build", "play"], ["C d", "M d"], (pressed) => {
    pressed &&
      debugMode.update(($mode) => {
        if ($mode === "hidden") return "minimal"
        if ($mode === "minimal") return "expanded"
        if ($mode === "expanded") return "hidden"
      })
  })
}
