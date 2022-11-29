import { registerAction } from "../comboTable";
import { isInputElement } from "../isInputEvent";

export function register(): Function {
  return registerAction(["play", "build"], ["tab"], (pressed, options) => {
    if (pressed && !isInputElement(document.activeElement, true)) {
      (document.getElementsByTagName("BUTTON")[0] as any)?.focus();
    }
  });
}
