import { debugMode } from "~/stores/debugMode";
import { registerAction } from "../comboTable";

export function register(): Function {
  return registerAction(["build", "play"], ["C d", "M d"], (pressed) => {
    pressed && debugMode.update(($mode) => !$mode);
  });
}
