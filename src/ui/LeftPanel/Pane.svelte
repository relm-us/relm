<script lang="ts">
  import { createEventDispatcher } from "svelte";

  // https://svelte-icons.vercel.app/
  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";
  import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";
  import IoIosArrowUp from "svelte-icons/io/IoIosArrowUp.svelte";

  export let title: string;
  export let subtitle: string;
  export let minimized = false;
  export let showClose = false;
  export let showMinimize = false;

  const dispatch = createEventDispatcher();
</script>

<style>
  pane {
    position: relative;

    border: 1px solid black;
    border-radius: 5px;

    margin: 8px 16px;
  }

  lbl {
    background-color: rgba(255, 255, 255, 0.25);
    display: block;
    padding: 4px 16px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    overflow: hidden;
    text-overflow: ellipsis;

    font-weight: bold;
    color: #eb4;
    letter-spacing: 0.5px;
  }

  lbl info {
    font-weight: normal;
    color: #eee;
  }

  icon {
    display: block;
    position: absolute;

    top: 2px;
    right: var(--right);

    cursor: pointer;
  }
  icon.close {
    width: 24px;
    height: 24px;
  }
  icon.minimize {
    top: 6px;
    width: 16px;
    height: 16px;
  }
</style>

<pane>
  {#if showClose}
    <icon
      class="close"
      on:mousedown={() => dispatch('close')}
      style="right: 5px">
      <IoIosClose />
    </icon>
  {/if}
  {#if showMinimize}
    <icon
      class="minimize"
      on:mousedown={() => {
        minimized = !minimized;
        dispatch('minimize', minimized);
      }}
      style={`right: ${showClose ? 28 : 5}px`}>
      {#if minimized}
        <IoIosArrowDown />
      {:else}
        <IoIosArrowUp />
      {/if}
    </icon>
  {/if}
  {#if title}
    <lbl>
      {title}
      {#if subtitle}
        <info>{subtitle}</info>
      {/if}
    </lbl>
  {/if}
  {#if !minimized}
    <slot />
  {/if}
</pane>
