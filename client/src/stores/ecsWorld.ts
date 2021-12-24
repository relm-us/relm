import { derived, Readable } from "svelte/store";

import { rapier } from "./rapier";
import { World } from "~/ecs/base";

import { createECSWorld } from "../world/createECSWorld";

export const ecsWorld: Readable<World> = derived(
  rapier,
  ($rapier, set) => {
    if ($rapier) set(createECSWorld($rapier));
  },
  null
);
