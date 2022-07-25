import { globalEvents } from "~/events";
import { registerAction } from "../comboTable";
import { permits } from "~/stores/permits";
import { get } from "svelte/store";

export function register(): Function {
  return registerAction(["play", "build"], ["tab"], (pressed, options) => {
    get(permits).includes("edit") &&
      pressed &&
      globalEvents.emit("switch-mode");
  });
}
