<script lang="ts">
  import Button from "../Button";
  import { worldRunning } from "~/stores/worldRunning";
  import PausedMessage from "./PausedMessage.svelte";
  import PauseAutomatically from "./PauseAutomatically.svelte";

  import IoIosPlay from "svelte-icons/io/IoIosPlay.svelte";
  import IoIosPause from "svelte-icons/io/IoIosPause.svelte";

  const onClick = () => {
    worldRunning.update(($running: boolean) => !$running);
  };
</script>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
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
</Button>

<PausedMessage />

<PauseAutomatically />
