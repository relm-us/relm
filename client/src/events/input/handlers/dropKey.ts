import { worldManager } from "~/world";

export function onKeydown(event) {
  if (event.key.toLowerCase() === "z") {
    worldManager.inventory.drop();
  }
}

export function onKeyup(event) {}
