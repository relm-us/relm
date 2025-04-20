<script lang="ts">
import { createEventDispatcher } from "svelte"
import { MathUtils } from "three"
import Rail from "./Rail.svelte"
import Thumb from "./Thumb.svelte"

export let value = 0.5
export let range = [0, 1]
export let constrain = (value) => value

const dispatch = createEventDispatcher()

let container
let offset
let positionAsRatio

$: positionAsRatio = value / (range[1] - range[0]) + range[0]

function updatePositionAsRatio(x: number, bbox: { left: number; width: number }) {
  const newRatio = MathUtils.clamp((x - bbox.left + (offset ?? 0)) / bbox.width, 0, 1)

  const s = range[0],
    r = range[1] - range[0]
  const value = constrain(newRatio * r + s)

  positionAsRatio = (value - s) / r
}

function getValueFromPosition(x: number, bbox: { left: number; width: number }) {
  updatePositionAsRatio(x, bbox)
  return positionAsRatio * (range[1] - range[0]) + range[0]
}

function setValue(newValue: number) {
  if (value !== newValue) {
    value = newValue
    dispatch("change", value)
  }
}

function onDragStart(event) {
  const { bbox } = event.detail
  offset = bbox.width / 2 - (event.detail.x - bbox.left)
  document.body.style.cursor = "pointer"
  dispatch("start")
}

function onDragMove(event) {
  const bbox = container.getBoundingClientRect()
  setValue(getValueFromPosition(event.detail.x, bbox))
}

function onDragEnd() {
  document.body.style.cursor = ""
  dispatch("end", value)
}

function onClick(event) {
  const bbox = container.getBoundingClientRect()
  setValue(getValueFromPosition(event.clientX, bbox))
}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<r-slider on:click={onClick}>
  <r-container bind:this={container}>
    <Rail>
      <Thumb
        {positionAsRatio}
        on:dragstart={onDragStart}
        on:dragging={onDragMove}
        on:dragend={onDragEnd}
      />
    </Rail>
  </r-container>
</r-slider>

<style>
  r-slider {
    display: block;

    padding: 8px;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
  }

  r-container {
    display: block;
  }
</style>
