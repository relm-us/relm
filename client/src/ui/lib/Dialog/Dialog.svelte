<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from "svelte";

  import Tint from "./Tint.svelte";
  import closeIcon from "./close-x.png";

  export let title: string;

  const dispatch = createEventDispatcher();

  const cancel = (source) => () => {
    dispatch("cancel", source);
  };
</script>

<Tint on:click={cancel("away")}>
  <r-dialog on:click|stopPropagation>
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

    color: var(--background-gray, black);

    padding: 28px 48px;
    background: radial-gradient(
      circle at 0% -100%,
      #666 -80% -80%,
      #000 100% 100%
    );
    border: 1.5px solid #585858;
    border-radius: 18px;
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
