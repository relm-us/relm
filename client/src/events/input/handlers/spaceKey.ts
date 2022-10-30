import { LONG_PRESS_THRESHOLD } from "~/config/constants";
import { keySpace } from "~/stores/keys";

import { globalEvents } from "~/events";

import { Action, registerAction } from "../comboTable";
import { callEach } from "~/utils/callEach";

let pressTimeStart;

export function register(): Function {
  const unregisters = [
    [
      ["play"],
      ["space"],
      (pressed) => {
        if (pressed) {
          pressTimeStart = performance.now();
        } else {
          const pressTimeEnd = performance.now();
          const heldTime = pressTimeEnd - pressTimeStart;
          if (heldTime > LONG_PRESS_THRESHOLD) {
            globalEvents.emit("action-long");
          } else {
            globalEvents.emit("action");
          }
        }
        keySpace.set(pressed);
      },
    ],
    [
      ["build"],
      ["space"],
      (pressed) => {
        keySpace.set(pressed);
      },
    ],
  ].flatMap(([contexts, keys, action]: [string[], string[], Action]) =>
    registerAction(contexts, keys, action)
  );

  return () => callEach(unregisters);
}
