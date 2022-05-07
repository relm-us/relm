<script lang="ts">
  import { MathUtils } from "three";
  import { get } from "svelte/store";
  import { hasAncestor, hasPointerInteractAncestor } from "~/utils/hasAncestor";

  import { viewportScale } from "~/stores/viewportScale";

  export let world;

  const scaleRange = { min: 0, max: 100 };

  let scale = get(viewportScale);

  function onWheel(event: WheelEvent) {
    const el = event.target as HTMLElement;
    if (
      hasAncestor(el, world.presentation.viewport) &&
      !hasPointerInteractAncestor(el)
    ) {
      const wheelStep = MathUtils.clamp(event.deltaY, -15, 15);
      scale = MathUtils.clamp(
        scale + wheelStep,
        scaleRange.min,
        scaleRange.max
      );

      viewportScale.set(scale);
    }
  }
</script>

<svelte:window on:wheel={onWheel} />
