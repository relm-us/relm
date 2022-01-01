import * as Y from "yjs";
import { YIDSTR } from "./types";

export function isEntityAttribute(key: string) {
  return (
    key === "id" ||
    key === "name" ||
    key === "parent" ||
    key === "children" ||
    key === "meta"
  );
}

export function yIdToString(yId: Y.ID): YIDSTR {
  return `${yId.client}-${yId.clock}`;
}

export function findInYArray<T>(
  yarray: Y.Array<T>,
  condition: (item: T) => boolean,
  action?: (item: T, index: number) => void
) {
  for (let i = 0; i < yarray.length; i++) {
    const item = yarray.get(i);
    if (condition(item)) {
      if (action) action(item, i);
      return item;
    }
  }
}
