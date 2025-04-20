<script lang="ts">
import { MathUtils } from "three"
import { get } from "svelte/store"
import { hasAncestor, hasPointerInteractAncestor } from "~/utils/hasAncestor"

import { viewportScale } from "~/stores/viewportScale"

export let world

const scaleRange = { min: 0, max: 200 }

// TODO: Does this normalize better? https://www.npmjs.com/package/normalize-wheel-es

function onWheel(event: WheelEvent) {
  const el = event.target as HTMLElement
  if (hasAncestor(el, world.presentation.viewport) && !hasPointerInteractAncestor(el)) {
    const wheelStep = MathUtils.clamp(event.deltaY, -5, 5)
    const scale = MathUtils.clamp(get(viewportScale) * scaleRange.max + wheelStep, scaleRange.min, scaleRange.max)

    viewportScale.set(scale / scaleRange.max)
  }
}
</script>

<svelte:window on:wheel={onWheel} />
