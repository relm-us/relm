import { playState } from "~/stores/playState";

export function onTogglePause() {
  playState.update(($state) => ($state === "paused" ? "playing" : "paused"));
}
