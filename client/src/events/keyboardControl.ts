import { get, derived } from "svelte/store";
import { controlDirection } from "~/stores/controlDirection";

import { keyUp, keyDown, keyLeft, keyRight, keyShift } from "~/stores/keys";
import { pressed } from "./input/pressed";

derived(
  [keyUp, keyDown, keyLeft, keyRight, keyShift, keyShift],
  ([up, down, left, right, shift]) => {
    const dir = get(controlDirection);

    dir.x = (left ? -1 : 0) + (right ? 1 : 0);
    dir.y = (up ? -1 : 0) + (down ? 1 : 0);

    dir.normalize();

    if (shift) dir.multiplyScalar(2);

    controlDirection.set(dir);
  }
).subscribe(() => {});

// Useful to be able to clear all pressed keys, e.g. when input focus leaves the browser
export function releaseHeldKeys() {
  keyUp.set(false);
  keyDown.set(false);
  keyLeft.set(false);
  keyRight.set(false);
  keyShift.set(false);

  pressed.clear();
}
