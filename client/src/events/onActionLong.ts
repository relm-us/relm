import { get } from "svelte/store";

import { worldUIMode } from "~/stores/worldUIMode";

export function onActionLong() {
  if (get(worldUIMode) === "play") {
    console.log("Long press");
  }
}
