<script lang="ts">
  import { MathUtils } from "three";

  import { scale as scaleStore } from "~/stores/viewport";

  const scaleRange = { min: 0, max: 100 };

  let scale = 0.0;

  function onWheel(event: WheelEvent) {
    const wheelStep = MathUtils.clamp(event.deltaY, -20, 20);
    scale = MathUtils.clamp(scale + wheelStep, scaleRange.min, scaleRange.max);

    scaleStore.set(scale);
  }
</script>

<svelte:window on:wheel={onWheel} />
