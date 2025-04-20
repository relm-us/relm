// The main component!
export { default as VideoMirror } from "./VideoMirror.svelte"

export type {
  State,
  Message,
  Dispatch,
  Effect,
  Program,
  DeviceIds,
} from "./program"

// Export stores
export * from "./stores/index"
