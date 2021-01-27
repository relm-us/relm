import { runCommand } from "~/commands";

export function onDropItem({ item }) {
  runCommand("createPrefab", { name: "Image", src: item.asset });
}
