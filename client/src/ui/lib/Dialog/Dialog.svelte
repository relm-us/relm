<script lang="ts">
import { createEventDispatcher } from "svelte"

import Tint from "./Tint.svelte"
import closeIcon from "./close-x.png"

export let title: string = null
export let align: "left" | "center" | "right" = "center"
export let tint: boolean = true
export let canCancel: boolean = true
export let paddingH: number = 48
export let fullHeight: boolean = false

const dispatch = createEventDispatcher()

const cancel = (source) => () => {
  if (canCancel) dispatch("cancel", source)
}
</script>

<Tint on:click={cancel("away")} {align} {tint}>
  <r-dialog
    on:click|stopPropagation
    style="--padding-h: {paddingH}px"
    class:fullHeight
  >
    {#if canCancel}
      <r-close style="--url: url({closeIcon})" on:click={cancel("close")} />
    {/if}
    {#if title}
      <r-title>{title}</r-title>
    {/if}
    <r-scroll>
      <r-body><slot /></r-body>
    </r-scroll>
  </r-dialog>
</Tint>

<style>
  r-dialog {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;

    margin-left: 8px;
    margin-right: 8px;

    padding: var(--padding-v, 32px) 0;

    max-height: calc(100% - 80px);

    /* Hide dialog footer corners, if present */
    overflow: hidden;

    color: var(--background-gray, black);
    background: radial-gradient(
      circle at 0% -100%,
      #666 -80% -80%,
      #000 100% 100%
    );

    border: 1.5px solid #585858;
    border-radius: 18px;
  }

  r-dialog.fullHeight {
    height: 100%;
  }

  r-dialog::-webkit-scrollbar-track-piece:end {
    background: transparent;
    margin-bottom: 10px;
  }

  r-dialog::-webkit-scrollbar-track-piece:start {
    background: transparent;
    margin-top: 10px;
  }

  r-close {
    position: absolute;
    right: 4px;
    top: 4px;

    background: var(--url) no-repeat;
    background-size: 100%;
    width: 9px;
    height: 9px;

    /* Expand click target */
    border: 9px solid transparent;
    cursor: pointer;
  }

  r-title {
    display: block;
    color: white;
    font-size: 36px;
    letter-spacing: 1px;
    margin: 0 var(--padding-h) 20px var(--padding-h);
  }

  r-scroll {
    display: block;
    overflow-y: auto;
  }
  r-body {
    display: block;
    margin: 0 var(--padding-h, 48px);
  }
</style>
