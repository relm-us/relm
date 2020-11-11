<script>
  import { createEventDispatcher } from "svelte";

  export let enabled = true;
  export let style;

  let dispatch = createEventDispatcher();
</script>

<style>
  button {
    display: block;
    border: 0;
    background-color: rgba(20, 20, 20, 0.4);
    color: #dddddd;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14pt;
    font-weight: bold;
    cursor: pointer;
    margin-left: 4px;
    margin-right: 4px;
  }
  button.disabled {
    pointer-events: none;
    opacity: 0.3;
  }
  button:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
  button:active {
    transform: translateY(1px);
  }
</style>

<button
  class:disabled={!enabled}
  {style}
  on:click={() => {
    dispatch('click');
  }}>
  <slot />
</button>
