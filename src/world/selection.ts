import { writable, Writable } from "svelte/store";

type EntityId = string;

export const hovered: Writable<Set<EntityId>> = writable(new Set());
export const selected: Writable<Set<EntityId>> = writable(new Set());
