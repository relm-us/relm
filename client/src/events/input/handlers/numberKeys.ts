import { globalEvents } from "~/events/globalEvents";
import { key1, key2, key3 } from "~/stores/keys";
import { callEach } from "~/utils/callEach";
import { Action, registerAction } from "../comboTable";

export function register(): Function {
  const unregisters = [
    [
      ["play"],
      ["1"],
      (pressed) => {
        key1.set(pressed);
      },
    ],
    [
      ["build"],
      ["1"],
      (pressed) => {
        pressed && globalEvents.emit("cycle-advanced-edit");
      },
    ],
    [
      ["play"],
      ["2"],
      (pressed) => {
        key2.set(pressed);
        pressed && globalEvents.emit("sit-ground");
      },
    ],
    [
      ["build"],
      ["2"],
      (pressed) => {
        pressed && globalEvents.emit("toggle-drag-action");
      },
    ],
    [
      ["play"],
      ["3"],
      (pressed) => {
        key3.set(pressed);
      },
    ],
    [
      ["build"],
      ["3"],
      (pressed) => {
        pressed && globalEvents.emit("toggle-selection-as-group");
      },
    ],
  ].flatMap(([contexts, keys, action]: [string[], string[], Action]) =>
    registerAction(contexts, keys, action)
  );

  return () => callEach(unregisters);
}
