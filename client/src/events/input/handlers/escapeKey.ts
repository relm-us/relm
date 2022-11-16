import { globalEvents } from "~/events/globalEvents";
import { registerAction } from "../comboTable";

export function register(): Function {
  return registerAction(["build", "play"], ["escape"], (pressed) => {
    pressed && globalEvents.emit("escape");
  });
}
