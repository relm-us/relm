<script lang="ts">
  import RenderedWorld from "~/ui/RenderedWorld";
  import FrameRateStats from "~/ui/FrameRateStats";
  import Editor from "~/ui/Editor.svelte";

  import { store as world } from "./world/store";
</script>

{#if $world}
  <RenderedWorld world={$world} />
{/if}

<Editor />

<FrameRateStats />
