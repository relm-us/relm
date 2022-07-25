import { globalEvents } from "~/events";
import { registerAction } from "../comboTable";

export function register() {
  registerAction(["build"], ["C z", "M z"], (pressed) => {
    pressed && globalEvents.emit("undo");
  });
  registerAction(["build"], ["C y", "S-M z", "S-C z"], (pressed) => {
    pressed && globalEvents.emit("redo");
  });
}
