<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";

  export let positionAsRatio;

  let thumb;
  const dispatch = createEventDispatcher();

  function handleStart(event) {
    event.preventDefault();
    const x = event.clientX;
    const bbox = event.target.getBoundingClientRect();
    thumb.setPointerCapture(event.pointerId);
    thumb.addEventListener("pointermove", handleMove);
    thumb.addEventListener("pointerup", handleEnd);
    dispatch("dragstart", { x, bbox });
  }

  function handleMove(event) {
    event.preventDefault();
    const x = event.clientX;
    const bbox = event.target.getBoundingClientRect();
    dispatch("dragging", { x, bbox });
  }

  function handleEnd(event) {
    event.preventDefault();
    thumb.removeEventListener("pointermove", handleMove);
    thumb.removeEventListener("pointerup", handleEnd);
    dispatch("dragend");
  }

  onMount(() => {
    thumb.addEventListener("pointerdown", handleStart);
  });
</script>

<r-thumb
  bind:this={thumb}
  style="left: {positionAsRatio * 100}%;"
  on:dragstart={handleStart}
  on:drag={handleMove}
  on:dragend={handleEnd}
/>

<style>
  r-thumb {
    display: block;
    width: 16px;
    height: 16px;

    position: absolute;
    left: 0;
    top: 50%;
    transform: translate(-50%, -50%);

    border-radius: 50%;
    border: 2px solid black;
    background: var(--sliderThumb, var(--sliderSecondary));
    touch-action: none;
    transition: 0.2s height, 0.2s width;
  }
  r-thumb:hover {
    background: var(--sliderThumbHover, var(--sliderThumb));
  }

  r-thumb:after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 32px;
    height: 32px;
    transform: translate(-50%, -50%);
    cursor: pointer;
  }

  r-thumb:before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    opacity: 0.3;
    background: var(--sliderThumb, var(--sliderSecondary));
    transform: translate(-50%, -50%) scale(0);
    transition: 0.2s all;
  }
</style>
