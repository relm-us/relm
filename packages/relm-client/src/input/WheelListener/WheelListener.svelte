<script lang="ts">
  import { MathUtils } from "three";
  import { get } from "svelte/store";

  import { scale as scaleStore } from "~/stores/viewport";

  const scaleRange = { min: 0, max: 100 };

  let scale = get(scaleStore);

  function onWheel(event: WheelEvent) {
    const wheelStep = MathUtils.clamp(event.deltaY, -15, 15);
    scale = MathUtils.clamp(scale + wheelStep, scaleRange.min, scaleRange.max);

    scaleStore.set(scale);
  }
</script>

<svelte:window on:wheel={onWheel} />
