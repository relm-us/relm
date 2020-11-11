<script lang="ts">
  import WorldContainer from "~/ui/WorldContainer";
  import Editor from "~/ui/Editor.svelte";
  import StatsPanel from "~/ui/StatsPanel";
  import Input, { keyUp } from "~/input";
  import PausePlayButton from "~/ui/PausePlayButton";
  import Button from "~/ui/Button";
  import ActionButton from "~/ui/ActionButton";

  import { store as world } from "./world/store";

  let performanceVisible = false;
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

<!-- The virtual world! -->
{#if $world}
  <WorldContainer world={$world} />
  {#if performanceVisible}
    <StatsPanel />
  {/if}

  <!-- Editor (TODO) -->
  <!-- <Editor world={$world} /> -->

  <!-- Keyboard, Mouse input -->
  <Input world={$world} />
{/if}

<button-panel>
  <Button
    on:click={() => {
      performanceVisible = !performanceVisible;
    }}>
    Perf
  </Button>
  <ActionButton />
  <PausePlayButton />
</button-panel>
