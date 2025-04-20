import { writable, type Writable } from "svelte/store"

import { BASE_LAYER_ID } from "~/config/constants"

export const layerActive: Writable<string> = writable(BASE_LAYER_ID)
