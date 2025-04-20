<script lang="ts">
import { worldManager } from "~/world"
import { hasAncestor } from "~/utils/hasAncestor"
import { worldUIMode } from "~/stores/worldUIMode"

import { isInputEvent } from "../isInputEvent"

import { onPointerUp, onPointerDown, onPointerMove } from "./pointerActions"
import { globalEvents } from "~/events/globalEvents"

let downEvent

function eventTargetsWorld(event, uiMode) {
  // If we're in between worlds, it can't be a world targetting event
  if (!worldManager.world) return false

  // Allow dragging Html2d objects, as well as selecting text
  if (isInputEvent(event)) return false

  // Prevent Renderable overlays (e.g. over websites) from erroneously
  // becoming PointerListener click targets. TODO: make this less hacky?
  if (event.target.tagName === "OVERLAY" && uiMode === "play") return false

  // An HTML element whose ancestor is the viewport is in the "world" (i.e. not part of the UI)
  return hasAncestor(event.target, worldManager.world.presentation.viewport)
}

function onDown(event: MouseEvent) {
  if (!eventTargetsWorld(event, $worldUIMode)) return

  // Record this event so we can send it to TouchControls later if needed
  downEvent = event

  // Prevent selecting text in Firefox
  event.preventDefault()

  globalEvents.emit("focus-world")

  onPointerDown(event.clientX, event.clientY, event.shiftKey)
}

function onMove(event: MouseEvent) {
  if (!eventTargetsWorld(event, $worldUIMode)) return
  onPointerMove(event.clientX, event.clientY, event.shiftKey, downEvent)
}

function onUp(event: MouseEvent) {
  if (!eventTargetsWorld(event, $worldUIMode)) return

  event.preventDefault()

  onPointerUp()
}
</script>

<svelte:window
  on:pointerdown={onDown}
  on:pointermove={onMove}
  on:pointerup={onUp}
/>
