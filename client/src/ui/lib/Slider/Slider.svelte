<script>
  import { createEventDispatcher } from "svelte";
  import { MathUtils } from "three";
  import Rail from "./Rail.svelte";
  import Thumb from "./Thumb.svelte";

  export let value = [0, 1];
  export let single = false;

  let container;
  let activeIndex;
  let offset;
  let dispatch = createEventDispatcher();

  function getStartListener(index) {
    return (event) => {
      activeIndex = index;
      const { bbox } = event.detail;
      offset = bbox.width / 2 - (event.detail.x - bbox.left);
      document.body.style.cursor = "pointer";
    };
  }

  function moveListener(event) {
    const bbox = container.getBoundingClientRect();
    const { x } = event.detail;
    let position = (x - bbox.left + offset) / bbox.width;

    if (position < 0) {
      position = 0;
    } else if (position > 1) {
      position = 1;
    }

    if (activeIndex === 0 && value[0] > value[1]) {
      activeIndex = 1;
      value[0] = value[1];
      return;
    } else if (activeIndex === 1 && value[1] < value[0]) {
      activeIndex = 0;
      value[1] = value[0];
      return;
    }

    if (value[activeIndex] === position) return;
    value[activeIndex] = position;
    dispatch("change", value);
  }

  function endListener() {
    document.body.style.cursor = "";
  }

  function onClick(event) {
    const bbox = container.getBoundingClientRect();
    let position = MathUtils.clamp(
      (event.clientX - bbox.left) / bbox.width,
      0,
      1
    );
    value[1] = position;
    dispatch("change", value);
  }
</script>

<div class="slider" on:click={onClick}>
  <div bind:this={container}>
    <Rail {value}>
      {#if !single}
        <Thumb
          position={value[0]}
          on:dragstart={getStartListener(0)}
          on:dragging={moveListener}
          on:dragend={endListener}
        />
      {/if}
      <Thumb
        position={value[1]}
        on:dragstart={getStartListener(1)}
        on:dragging={moveListener}
        on:dragend={endListener}
      />
    </Rail>
  </div>
</div>

<style>
  .slider {
    padding: 8px;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
  }
</style>
