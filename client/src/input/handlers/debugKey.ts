import { debugMode } from "~/stores/debugMode";

export function onKeydown(event) {
  if (event.key.toLowerCase() === "d") {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      debugMode.update(($mode) => !$mode);
    }
  }
}

export function onKeyup(event) {}
