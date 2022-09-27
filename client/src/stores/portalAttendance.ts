import { writable, Writable } from "svelte/store";

export const portalAttendance: Writable<Record<string, number>> = writable({});
