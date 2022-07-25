import { globalEvents } from "~/events";
import { key1, key2, key3 } from "~/stores/keys";
import { registerAction } from "../comboTable";

export function register() {
  registerAction(["play"], ["1"], (pressed) => {
    key1.set(pressed);
  });
  registerAction(["build"], ["1"], (pressed) => {
    pressed && globalEvents.emit("advanced-edit");
  });
  registerAction(["play"], ["2"], (pressed) => {
    key2.set(pressed);
    pressed && globalEvents.emit("sit");
  });
  registerAction(["play"], ["3"], (pressed) => {
    key3.set(pressed);
  });
}
