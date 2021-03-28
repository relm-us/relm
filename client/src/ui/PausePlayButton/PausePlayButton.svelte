<script lang="ts">
  import Button from "../Button";
  import { playState } from "~/stores/playState";
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
    playState.update(($state) => {
      switch ($state) {
        case "playing":
          return "paused";
        case "paused":
          return "playing";
        default:
          console.warn("Unknown playState", $state);
          return $state;
      }
    });
  };
</script>

<Button on:click={onClick}>
  <div>
    <icon>
      {#if $playState === "playing"}
        <IoIosPause />
      {:else if $playState === "paused"}
        <IoIosPlay />
      {/if}
    </icon>
    {#if neverPauseAutomatically}
      <dot />
    {/if}
  </div>
</Button>

<PausedMessage />

{#if !neverPauseAutomatically}
  <PauseAutomatically />
{/if}

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
  }
  div {
    position: relative;
  }
  dot {
    display: block;
    width: 7px;
    height: 7px;

    position: absolute;
    left: -4px;
    top: 12.5px;

    border-radius: 7px;
    background-color: white;
  }
</style>
