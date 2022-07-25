import { globalEvents } from "~/events";
import { registerAction } from "../comboTable";

export function register() {
  registerAction(["play", "build"], ["tab"], (pressed, options) => {
    options.permits.includes("edit") &&
      pressed &&
      globalEvents.emit("switch-mode");
  });
}
