import { globalEvents } from "~/events";
import { registerAction } from "../comboTable";

export function register() {
  registerAction(["play"], ["backspace", "delete"], (pressed) => {
    pressed && globalEvents.emit("delete");
  });
}
