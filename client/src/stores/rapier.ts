import { readable } from "svelte/store"

export const rapier = readable(null, (set) => {
  import("@dimforge/rapier3d")
    .then((rapier) => {
      set(rapier)
    })
    .catch((error) => {
      console.error("Can't load physics engine rapier3d", error.message, error.stack)
    })
})
