import { createPrefab } from "~/prefab";

export function onDropItem({ item }) {
  createPrefab("Image", {
    y: item.base,
    xa: item.orientation === "down" ? Math.PI / 2 : 0,
    w: item.size.w,
    h: item.size.h,
    d: item.size.d,
    url: item.asset,
  });
}
