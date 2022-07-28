import { worldManager } from "~/world";
import { registerAction } from "../comboTable";

export function register(): Function {
  return registerAction(["play"], ["z"], (pressed) => {
    pressed && worldManager.inventory.drop();
  });
}
