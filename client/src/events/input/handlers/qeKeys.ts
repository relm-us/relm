import { globalEvents } from "~/events";
import { callEach } from "~/utils/callEach";
import { keyQ, keyE } from "~/stores/keys";

import { registerAction, Action } from "../comboTable";

export function register(): Function {
  const unregisters = [
    [
      ["q"],
      (pressed) => {
        keyQ.set(pressed);
        pressed && globalEvents.emit("camera-rotate-left");
      },
    ],
    [
      ["e"],
      (pressed) => {
        keyE.set(pressed);
        pressed && globalEvents.emit("camera-rotate-right");
      },
    ],
  ].flatMap(([keys, action]: [string[], Action]) =>
    registerAction(["play"], keys, action)
  );

  return () => callEach(unregisters);
}
