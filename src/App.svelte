<script lang="ts">
  import WorldContainer from "~/ui/WorldContainer";
  import Editor from "~/ui/Editor.svelte";
  import StatsPanel from "~/ui/StatsPanel";
  import Input, { keyUp } from "~/input";
  import PausePlayButton from "~/ui/PausePlayButton";
  import ActionButton from "~/ui/ActionButton";

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

<!-- The virtual world! -->
{#if $world}
  <WorldContainer world={$world} />
  <StatsPanel renderer={$world.presentation.renderer} />
{/if}

<button-panel>
  <ActionButton />
  <PausePlayButton />
</button-panel>

<!-- Editor (TODO) -->
<Editor />

<!-- Keyboard, Mouse input -->
<Input />
