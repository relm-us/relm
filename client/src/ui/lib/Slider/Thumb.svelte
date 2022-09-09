<script>
  import { onMount, createEventDispatcher } from "svelte";

  export let position;

  let thumb;
  let bbox;
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

<div
  bind:this={thumb}
  class="thumb"
  style="left: {position * 100}%;"
  on:start={handleStart}
  on:move={handleMove}
  on:end={handleEnd}
/>

<style>
  .thumb {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 0;
    top: 50%;
    border-radius: 50%;
    border: 2px solid black;
    background: var(--sliderThumb, var(--sliderSecondary));
    touch-action: none;
    transform: translate(-50%, -50%);
    transition: 0.2s height, 0.2s width;
  }
  .thumb:hover {
    background: var(--sliderThumbHover, var(--sliderThumb));
  }

  .thumb:after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 32px;
    height: 32px;
    transform: translate(-50%, -50%);
    cursor: pointer;
  }

  .thumb:before {
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
