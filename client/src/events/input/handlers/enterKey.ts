import { chatOpen, chatFocused } from "~/stores/chat";
import { registerAction } from "../comboTable";

export function register(): Function {
  return registerAction(["play"], ["enter", "return"], (pressed) => {
    if (pressed) {
      chatOpen.set(true);
      chatFocused.set(true);
    }
  });
}
