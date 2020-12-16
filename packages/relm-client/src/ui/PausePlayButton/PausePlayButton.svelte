<script lang="ts">
  import Button from "../Button";
  import { worldRunning } from "~/stores/worldRunning";
  import PausedMessage from "./PausedMessage.svelte";
  import PauseAutomatically from "./PauseAutomatically.svelte";

  import IoIosPlay from "svelte-icons/io/IoIosPlay.svelte";
  import IoIosPause from "svelte-icons/io/IoIosPause.svelte";

  const DOUBLE_CLICK_MS = 400;

  let prevClickTimestamp = -DOUBLE_CLICK_MS;
  let neverPauseAutomatically = false;

  const isDoubleClick = () => {
    const now = performance.now();
    const delta = now - prevClickTimestamp;
    prevClickTimestamp = now;
    return delta < DOUBLE_CLICK_MS;
  };

  const onClick = () => {
    if (isDoubleClick()) {
      neverPauseAutomatically = !neverPauseAutomatically;
    }
    worldRunning.update(($running: boolean) => !$running);
  };
</script>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
  }
  dot {
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 7px;
    background-color: white;
    position: absolute;
    margin-left: -3px;
    margin-top: -3px;
  }
</style>

<Button on:click={onClick}>
  <icon>
    {#if $worldRunning}
      <IoIosPause />
    {:else}
      <IoIosPlay />
    {/if}
  </icon>
  {#if neverPauseAutomatically}
    <dot />
  {/if}
</Button>

<PausedMessage />

{#if !neverPauseAutomatically}
  <PauseAutomatically />
{/if}
