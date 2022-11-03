import { createPrefab } from "~/prefab";
import { makeImage } from "~/prefab/makeImage";

export function onDropItem({ item }) {
  createPrefab(makeImage, {
    y: item.base,
    xa: item.orientation === "down" ? Math.PI / 2 : 0,
    w: item.size.w,
    h: item.size.h,
    d: item.size.d,
    url: item.asset,
  });
}
