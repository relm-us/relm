import { playState } from "~/stores/playState";

export function onKeydown(event) {
  if (event.key.toLowerCase() === "p") {
    playState.update(($state) => ($state === "paused" ? "playing" : "paused"));
  }
}

export function onKeyup(event) {}
