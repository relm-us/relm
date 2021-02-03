import { runCommand } from "~/commands";

export function onDropItem({ item }) {
  runCommand(
    "createPrefab",
    {
      name: "Image",
      src: item.asset,
    },
    {
      y: item.base,
      xa: item.orientation === "down" ? Math.PI / 2 : 0,
      w: item.size.w,
      h: item.size.h,
      d: item.size.d,
    }
  );
}
