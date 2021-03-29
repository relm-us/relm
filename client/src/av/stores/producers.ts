import { writable, Writable } from "svelte/store";
import { types } from 'mediasoup-client'

export const producers: Writable<Record<string, types.Producer>> = writable({});
