import { keyShift } from "../store";

export function onKeydown(event: KeyboardEvent) {
  if (event.key === "Shift") keyShift.set(true);
}

export function onKeyup(event: KeyboardEvent) {
  if (event.key === "Shift") keyShift.set(false);
}
