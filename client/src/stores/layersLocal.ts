import type { WorldLayerLocal } from "~/types";

import { writable, Writable } from "svelte/store";

import { BASE_LAYER_ID } from "~/config/constants";

// Keep local layer data, such as whether or not a layer is visible
export const layersLocal: Writable<Map<string, WorldLayerLocal>> = writable(
  new Map(Object.entries({ [BASE_LAYER_ID]: { visible: true } }))
);

(window as any).layersLocal = layersLocal;
