import { globalEvents } from "~/events";
import { registerAction } from "../comboTable";

export function register(): Function {
  return registerAction(["build", "play"], ["escape"], (pressed) => {
    pressed && globalEvents.emit("escape");
  });
}
