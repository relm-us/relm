<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let enabled = true;
  export let style: string | undefined = undefined;

  let dispatch = createEventDispatcher();
</script>

<style>
  button {
    display: block;

    margin-left: var(--margin, 16px);
    margin-right: var(--margin, 16px);
    padding: 8px 12px;

    cursor: pointer;

    background-color: var(--bg-color, rgba(0, 0, 0, 0.4));
    color: #dddddd;

    font-size: 14pt;
    font-weight: bold;

    border: 1px solid rgba(255, 255, 255, 0.5);
    border-top-right-radius: var(--right-radius, 8px);
    border-bottom-right-radius: var(--right-radius, 8px);
    border-top-left-radius: var(--left-radius, 8px);
    border-bottom-left-radius: var(--left-radius, 8px);

    transform: rotate(90deg);
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

<button
  {style}
  class:disabled={!enabled}
  on:mousedown|stopPropagation={() => {
    dispatch('click');
  }}>
  <slot />
</button>
