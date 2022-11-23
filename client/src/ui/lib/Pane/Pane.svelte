<script lang="ts">
  import { createEventDispatcher } from "svelte";

  // https://svelte-icons.vercel.app/
  import IoMdClose from "svelte-icons/io/IoMdClose.svelte";
  import IoMdFlash from "svelte-icons/io/IoMdFlash.svelte";
  import IoMdFlashOff from "svelte-icons/io/IoMdFlashOff.svelte";

  export let title: string;
  export let subtitle: string = null;
  export let minimized = false;

  export let showClose = false;
  export let showActivate = false;
  export let isActive = true;

  function onMinimize() {
    minimized = !minimized;
    dispatch("minimize", minimized);
  }

  function onClose() {
    dispatch("close");
  }

  function onToggleActive() {
    dispatch(isActive ? "deactivate" : "activate");
  }

  const dispatch = createEventDispatcher();
</script>

<r-pane>
  <r-icon-bar>
    {#if showClose}
      <r-icon on:mousedown|preventDefault={onClose}>
        <IoMdClose />
      </r-icon>
    {/if}
    {#if showActivate}
      <r-icon on:mousedown|preventDefault={onToggleActive}>
        {#if isActive}
          <IoMdFlash />
        {:else}
          <IoMdFlashOff />
        {/if}
      </r-icon>
    {/if}
  </r-icon-bar>

  {#if title}
    <r-label on:mousedown|preventDefault={onMinimize}>
      <span style="cursor: pointer">{title}</span>
      {#if subtitle}
        <info>{subtitle}</info>
      {/if}
    </r-label>
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
    padding: var(--pane-padding, 4px 12px);
  }

  r-label {
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

  r-label info {
    font-weight: normal;
    color: #eee;
  }

  r-icon-bar {
    display: flex;
    position: absolute;
    justify-content: flex-start;
    flex-direction: row-reverse;

    top: 2px;
    right: 6px;

    cursor: pointer;
    pointer-events: all;
  }
  r-icon {
    display: block;
    width: 18px;
    height: 18px;
    padding: 2px;
  }
  r-icon:hover {
    background-color: rgba(255, 255, 255, 0.35);
    border-radius: 3px;
  }
</style>
