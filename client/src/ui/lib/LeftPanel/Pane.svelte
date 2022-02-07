<script lang="ts">
  import { createEventDispatcher } from "svelte";

  // https://svelte-icons.vercel.app/
  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";
  import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";
  import IoIosArrowUp from "svelte-icons/io/IoIosArrowUp.svelte";
  import IoIosMenu from "svelte-icons/io/IoIosMenu.svelte";

  export let title: string;
  export let subtitle: string = null;
  export let minimized = false;

  export let showClose = false;
  export let showMinimize = false;
  export let showSettings = false;

  const dispatch = createEventDispatcher();
</script>

<r-pane>
  <icon-bar>
    {#if showClose}
      <icon on:mousedown|preventDefault={() => dispatch("close")}>
        <IoIosClose />
      </icon>
    {/if}
    {#if showSettings}
      <icon
        class="small"
        on:mousedown|preventDefault={() => dispatch("settings")}
      >
        <IoIosMenu />
      </icon>
    {/if}
    {#if showMinimize}
      <icon
        class="minimize"
        on:mousedown|preventDefault={() => {
          minimized = !minimized;
          dispatch("minimize", minimized);
        }}
      >
        {#if minimized}
          <IoIosArrowDown />
        {:else}
          <IoIosArrowUp />
        {/if}
      </icon>
    {/if}
  </icon-bar>

  {#if title}
    <lbl>
      {title}
      {#if subtitle}
        <info>{subtitle}</info>
      {/if}
    </lbl>
  {/if}
  {#if !minimized}
    <r-content>
      <slot />
    </r-content>
  {/if}
</r-pane>

<style>
  r-pane {
    position: relative;

    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.35));
    border-radius: 5px;

    margin: 8px 16px;
  }
  r-content {
    display: block;
    padding: var(--pane-padding, 12px);
  }

  lbl {
    background-color: var(--bg-color, rgba(255, 255, 255, 0.25));
    display: block;
    padding: 4px 16px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    overflow: hidden;
    text-overflow: ellipsis;

    font-weight: bold;
    color: var(--label-color, #eb4);
    letter-spacing: 0.5px;
  }

  lbl info {
    font-weight: normal;
    color: #eee;
  }

  icon-bar {
    display: flex;
    position: absolute;
    justify-content: flex-start;
    flex-direction: row-reverse;

    width: 100%;
    top: 2px;
    right: 8px;

    cursor: pointer;
    pointer-events: all;
  }
  icon {
    width: 24px;
    height: 24px;
    margin-left: -2px;
    margin-right: -2px;
  }
  icon.small {
    transform: scale(0.75);
  }
  icon.minimize {
    transform: scale(0.68) translateY(-2px);
  }
</style>
