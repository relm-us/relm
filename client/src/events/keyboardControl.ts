import { get, derived } from "svelte/store";
import { controlDirection } from "~/stores/controlDirection";

import { keyUp, keyDown, keyLeft, keyRight, keyShift } from "~/stores/keys";

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
