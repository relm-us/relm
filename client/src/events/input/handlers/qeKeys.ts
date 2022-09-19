import { globalEvents } from "~/events";
import { callEach } from "~/utils/callEach";
import { registerAction, Action } from "../comboTable";

export function register(): Function {
  const unregisters = [
    [
      ["q"],
      (pressed) => {
        pressed && globalEvents.emit("camera-rotate-left");
      },
    ],
    [
      ["e"],
      (pressed) => {
        pressed && globalEvents.emit("camera-rotate-right");
      },
    ],
  ].flatMap(([keys, action]: [string[], Action]) =>
    registerAction(["play"], keys, action)
  );

  return () => callEach(unregisters);
}
