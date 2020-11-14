<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let enabled = true;
  export let style: string | undefined = undefined;

  let dispatch = createEventDispatcher();
</script>

<style>
  button {
    display: block;

    margin-left: 4px;
    margin-right: 4px;
    padding: 8px 12px;

    cursor: pointer;

    background-color: rgba(0, 0, 0, 0.4);
    color: #dddddd;

    font-size: 14pt;
    font-weight: bold;

    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 8px;
  }
  button.disabled {
    pointer-events: none;
    opacity: 0.3;
  }
  button:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
  button:active {
    transform: translateY(1px);
  }
</style>

<button
  class:disabled={!enabled}
  {style}
  on:mousedown|stopPropagation={() => {
    dispatch('click');
  }}>
  <slot />
</button>
