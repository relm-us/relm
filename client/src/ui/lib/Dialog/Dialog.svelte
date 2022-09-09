<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Tint from "./Tint.svelte";
  import closeIcon from "./close-x.png";

  export let title: string;
  export let align: "left" | "center" | "right" = "center";
  export let tint: boolean = true;
  export let paddingH: number = 48;

  const dispatch = createEventDispatcher();

  const cancel = (source) => () => {
    dispatch("cancel", source);
  };
</script>

<Tint on:click={cancel("away")} {align} {tint}>
  <r-dialog on:click|stopPropagation style="--padding-h: {paddingH}px">
    <r-close style="--url: url({closeIcon})" on:click={cancel("close")} />
    <r-title>{title}</r-title>
    <r-body><slot /></r-body>
  </r-dialog>
</Tint>

<style>
  r-dialog {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;

    margin-left: 8px;
    margin-right: 8px;

    max-height: calc(100% - 80px);
    overflow-y: auto;

    color: var(--background-gray, black);

    padding: var(--padding-v, 28px) var(--padding-h, 48px);
    background: radial-gradient(
      circle at 0% -100%,
      #666 -80% -80%,
      #000 100% 100%
    );
    border: 1.5px solid #585858;
    border-radius: 18px;
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
    margin-bottom: 20px;
  }

  r-body {
    display: flex;
    flex-direction: column;
  }
</style>
