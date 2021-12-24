import { writable, Writable } from "svelte/store";

import type { WorldDoc } from "~/y-integration/WorldDoc";

export const worldDoc: Writable<WorldDoc> = writable(null);
