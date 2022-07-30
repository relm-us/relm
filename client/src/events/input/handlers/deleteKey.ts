import { globalEvents } from "~/events";
import { registerAction } from "../comboTable";

export function register(): Function {
  return registerAction(["build"], ["backspace", "delete"], (pressed) => {
    pressed && globalEvents.emit("delete");
  });
}
