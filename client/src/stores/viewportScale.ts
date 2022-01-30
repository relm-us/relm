import { writable, Writable } from "svelte/store";

import { DEFAULT_VIEWPORT_ZOOM } from "~/config/constants";

export const viewportScale: Writable<number> = writable(DEFAULT_VIEWPORT_ZOOM);
