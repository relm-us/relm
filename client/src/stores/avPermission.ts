import { writable, Writable } from 'svelte/store'

export type AVPermission = {
  done: boolean;
  audio: boolean;
  video: boolean;
}

export const avPermission: Writable<AVPermission> = writable({
  done: false,
  audio: false,
  video: false,
})
