<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let enabled = true;
  export let active: boolean = undefined;
  export let style: string = undefined;
  export let tabindex: number = undefined;
  export let depress: boolean = true;

  let dispatch = createEventDispatcher();
</script>

<button
  {style}
  class:disabled={!enabled}
  class:active={active === true}
  class:depress
  on:mousedown|stopPropagation={() => {
    dispatch("click");
  }}
  {tabindex}
>
  <slot />
</button>

<style>
  button {
    display: flex;
    flex-direction: var(--direction, column);
    justify-content: center;
    align-items: center;

    margin-left: var(--margin, 16px);
    margin-right: var(--margin, 16px);
    padding: var(--padv, 4px) var(--padh, 20px);

    cursor: pointer;

    background-color: var(--bg-color, var(--selected-orange));
    color: var(--fg-color, var(--background-gray));

    font-size: var(--font-size, 16px);

    border: var(--button-border, 0);
    border-top-right-radius: var(--top-radius, var(--right-radius, 14px));
    border-bottom-right-radius: var(--bottom-radius, var(--right-radius, 14px));
    border-top-left-radius: var(--top-radius, var(--left-radius, 14px));
    border-bottom-left-radius: var(--bottom-radius, var(--left-radius, 14px));
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
    background-color: var(--bg-hover-color, var(--selected-orange-hover));
  }
  button.depress:active {
    transform: translateY(1px);
  }
</style>
