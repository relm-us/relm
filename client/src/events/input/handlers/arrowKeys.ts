import { keyUp, keyDown, keyLeft, keyRight, keyQ, keyE } from "~/stores/keys";
import { registerAction } from "../comboTable";

export function register() {
  registerAction(["play", "build"], ["arrowup", "w", "k"], (pressed) => {
    keyUp.set(pressed);
  });
  registerAction(["play", "build"], ["arrowdown", "s", "j"], (pressed) => {
    keyDown.set(pressed);
  });
  registerAction(["play", "build"], ["arrowleft", "a", "h"], (pressed) => {
    keyLeft.set(pressed);
  });
  registerAction(["play", "build"], ["arrowright", "d", "l"], (pressed) => {
    keyRight.set(pressed);
  });
}
