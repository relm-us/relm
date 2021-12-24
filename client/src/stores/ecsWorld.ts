import { derived, Readable } from "svelte/store";

import { rapier } from "./rapier";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { createECSWorld } from "../world/createECSWorld";

export const ecsWorld: Readable<DecoratedECSWorld> = derived(
  rapier,
  ($rapier, set) => {
    if ($rapier) set(createECSWorld($rapier));
  },
  null
);
