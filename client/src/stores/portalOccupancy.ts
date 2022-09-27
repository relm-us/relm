import { writable, Writable } from "svelte/store";

export const portalOccupancy: Writable<Record<string, number>> = writable({});
