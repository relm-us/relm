import { writable, type Writable } from "svelte/store"
import { Vector3 } from "three"
import type { GroupTree } from "./selection"

export type CopyBuffer = {
  center: Vector3
  entities: Array<string>
  groupTree: GroupTree
}

export const copyBuffer: Writable<CopyBuffer> = writable({
  center: new Vector3(),
  entities: [],
  groupTree: null,
})
