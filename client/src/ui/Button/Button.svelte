<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let enabled = true;
  export let active: boolean = undefined;
  export let style: string = undefined;

  let dispatch = createEventDispatcher();
</script>

<style>
  button {
    display: flex;
    flex-direction: var(--direction, column);
    justify-content: center;
    align-items: center;

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
  }
  button:focus {
    outline: none;
    border-bottom-color: rgba(255, 255, 255, 1);
  }
  button.disabled {
    pointer-events: none;
    opacity: 0.3;
  }
  button:hover,
  button.active {
    background-color: var(--bg-hover-color, rgba(0, 0, 0, 0.8));
  }
  button:active {
    transform: translateY(1px);
  }
</style>

<button
  {style}
  class:disabled={!enabled}
  class:active={active === true}
  on:mousedown|stopPropagation={() => {
    dispatch('click');
  }}>
  <slot />
</button>
