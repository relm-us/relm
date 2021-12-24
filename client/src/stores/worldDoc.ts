import { derived, Readable } from "svelte/store";

import { ecsWorld } from "./ecsWorld";

import { WorldDoc } from "~/y-integration/WorldDoc";

export const worldDoc: Readable<WorldDoc> = derived(
  ecsWorld,
  ($ecsWorld, set) => {
    if ($ecsWorld) set(new WorldDoc($ecsWorld));
  },
  null
);
