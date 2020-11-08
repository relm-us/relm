<script lang="ts">
  import WorldContainer from "~/ui/WorldContainer";
  import FrameRateStats from "~/ui/FrameRateStats";
  import Editor from "~/ui/Editor.svelte";
  import Input, { keyUp } from "~/input";

  import { store as world } from "./world/store";
</script>

<!-- Show stats.js frame rate in corner -->
<FrameRateStats />

<!-- The virtual world! -->
{#if $world}
  <WorldContainer world={$world} />
{/if}

<!-- Editor (TODO) -->
<Editor />

<!-- Keyboard, Mouse input -->
<Input />
