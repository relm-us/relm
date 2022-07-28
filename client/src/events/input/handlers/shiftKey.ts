import { keyShift } from "~/stores/keys";
import { registerAction } from "../comboTable";

export function register(): Function {
  return registerAction(["build"], ["shift"], (pressed) => {
    keyShift.set(pressed);
  });
}
