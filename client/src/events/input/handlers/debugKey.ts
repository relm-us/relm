import { debugMode } from "~/stores/debugMode";
import { registerAction } from "../comboTable";

export function register() {
  registerAction(["play"], ["C d", "M d"], (pressed) => {
    pressed && debugMode.update(($mode) => !$mode);
  });
}
