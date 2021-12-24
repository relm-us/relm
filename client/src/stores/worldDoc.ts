import { derived, Readable } from "svelte/store";

import { world } from "./world";

import { WorldDoc } from "~/y-integration/WorldDoc";

export const worldDoc: Readable<WorldDoc> = derived(
  world,
  ($world, set) => {
    console.log("$world", $world);
    if ($world) set(new WorldDoc($world));
  },
  null
);
