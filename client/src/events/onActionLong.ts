import { get } from "svelte/store";

import { worldUIMode } from "~/stores/worldUIMode";

import { ItemActorSystem } from "~/ecs/plugins/item/systems";
import { Clickable, Clicked } from "~/ecs/plugins/clickable";

export function onActionLong() {
  if (get(worldUIMode) === "play") {
    console.log("Long press");
  }
}
