<script lang="ts">
  import RequiresRapier from "./RequiresRapier.svelte";
  import RenderedWorld from "./RenderedWorld.svelte";
  import FrameRateStats from "./FrameRateStats.svelte";
</script>

<RequiresRapier>
  <RenderedWorld />
</RequiresRapier>

<FrameRateStats />
