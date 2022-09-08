<script lang="ts">
  import { SvelteComponent } from "svelte";

  import { createEventDispatcher } from "svelte";

  export let enabled: boolean = true;
  export let size: number = 48;
  export let margin: number = 2;
  export let padding: number = null;
  export let Icon: SvelteComponent | any = null;
  export let iconSize: number = 32;

  $: if (padding === null) padding = size / 6;

  let dispatch = createEventDispatcher();
</script>

<button
  style="width: {size}px; height: {size}px; margin: {margin}px; padding: {padding}px"
  class:disabled={!enabled}
  on:mousedown|stopPropagation={() => {
    dispatch("click");
  }}
>
  {#if Icon}
    <icon style="--icon-size: {iconSize}px">
      <svelte:component this={Icon} />
    </icon>
  {/if}
  <slot />
</button>

<style>
  button {
    display: flex;
    flex-direction: var(--direction, column);
    flex-shrink: 0;
    justify-content: center;
    align-items: center;

    cursor: pointer;

    background-color: var(--bg-color, var(--background-tray));
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

  icon {
    display: block;
    width: var(--icon-size, 32px);
    height: var(--icon-size, 32px);
    margin: 0 auto;
  }
</style>
