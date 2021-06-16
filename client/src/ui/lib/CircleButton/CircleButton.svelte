<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let enabled = true;
  export let size = 48;

  let dispatch = createEventDispatcher();

</script>

<button
  style="--size: {size}px"
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

    margin: var(--margin, 16px);
    padding: var(--padding, 8px);
    width: var(--size, 48px);
    height: var(--size, 48px);

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
