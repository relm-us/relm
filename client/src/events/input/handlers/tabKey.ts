import { globalEvents } from "~/events/globalEvents";
import { registerAction } from "../comboTable";

export function register(): Function {
  return registerAction(["play", "build"], ["tab"], (pressed, options) => {
    pressed && globalEvents.emit("switch-mode");
  });
}
