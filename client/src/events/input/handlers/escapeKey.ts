import { globalEvents } from "~/events";
import { registerAction } from "../comboTable";

export function register() {
  registerAction(["play"], ["escape"], (pressed) => {
    pressed && globalEvents.emit("escape");
  });
}
