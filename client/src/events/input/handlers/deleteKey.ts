import { globalEvents } from "~/events";
import { registerAction } from "../comboTable";

export function register(): Function {
  return registerAction(["play"], ["backspace", "delete"], (pressed) => {
    pressed && globalEvents.emit("delete");
  });
}
