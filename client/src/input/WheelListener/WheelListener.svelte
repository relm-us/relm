<script lang="ts">
  import { MathUtils } from "three";
  import { get } from "svelte/store";
  import { hasAncestor } from "~/utils/hasAncestor";

  import { viewportScale } from "~/stores/viewportScale";

  export let world;

  const scaleRange = { min: 0, max: 100 };

  let scale = get(viewportScale);

  function onWheel(event: WheelEvent) {
    if (hasAncestor(event.target as HTMLElement, world.presentation.viewport)) {
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
