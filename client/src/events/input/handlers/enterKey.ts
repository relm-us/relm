import { openDialog } from "~/stores/openDialog";

import { registerAction } from "../comboTable";

export function register(): Function {
  return registerAction(["play"], ["enter", "return"], (pressed) => {
    pressed && openDialog.set("chat");
  });
}
