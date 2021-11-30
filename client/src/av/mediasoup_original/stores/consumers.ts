import { writable, Writable } from "svelte/store";
import { types } from 'mediasoup-client'

export const consumers: Writable<Record<string, types.Consumer>> = writable({});
