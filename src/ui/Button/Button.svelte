<script>
  import { createEventDispatcher } from "svelte";

  export let enabled = true;

  let dispatch = createEventDispatcher();
</script>

<style>
  button {
    display: block;
    border: 0;
    background-color: rgba(20, 20, 20, 0.4);
    color: #dddddd;
    padding: 12px 18px;
    border-radius: 8px;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
  }
  button.disabled {
    pointer-events: none;
    opacity: 0.3;
  }
  button:hover {
    background-color: #ffb840;
  }
  button:active {
    transform: translateY(1px);
  }
</style>

<button
  class:disabled={!enabled}
  on:click={() => {
    dispatch('click');
  }}>
  <slot />
</button>
