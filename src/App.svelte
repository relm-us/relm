<script lang="ts">
  import WorldContainer from "~/ui/WorldContainer";
  import FrameRateStats from "~/ui/FrameRateStats";
  import Editor from "~/ui/Editor.svelte";
  import Input, { keyUp } from "~/input";
  import PausePlayButton from "~/ui/PausePlayButton";

  import { store as world } from "./world/store";
</script>

<style>
  button-panel {
    display: flex;
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 2;
  }
</style>

<!-- Show stats.js frame rate in corner -->
<FrameRateStats />

<!-- The virtual world! -->
{#if $world}
  <WorldContainer world={$world} />
{/if}

<button-panel>
  <PausePlayButton />
</button-panel>

<!-- Editor (TODO) -->
<Editor />

<!-- Keyboard, Mouse input -->
<Input />
