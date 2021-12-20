<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let enabled: boolean = true;
  export let size: number = 48;
  export let margin: number = 2;
  export let padding: number = null;

  $: if (!padding) padding = size / 6;

  let dispatch = createEventDispatcher();
</script>

<button
  style="width: {size}px; height: {size}px; margin: {margin}px; padding: {padding}px"
  class:disabled={!enabled}
  on:mousedown|stopPropagation={() => {
    dispatch("click");
  }}
>
  <slot />
</button>

<style>
  button {
    display: flex;
    flex-direction: var(--direction, column);
    justify-content: center;
    align-items: center;

    cursor: pointer;

    background-color: var(--bg-color, rgba(0, 0, 0, 0.4));
    color: var(--fg-color, #dddddd);

    font-size: var(--font-size, 14pt);
    font-weight: bold;

    border: 0;
    border-radius: 100%;
  }
  button:focus {
    outline: none;
    border-bottom-color: rgba(255, 255, 255, 1);
  }
  button.disabled {
    pointer-events: none;
    opacity: 0.3;
  }
  button:hover {
    background-color: var(--bg-hover-color, rgba(0, 0, 0, 0.8));
  }
  button:active {
    transform: translateY(1px);
  }
</style>
