<script lang="ts">
  import RequiresRapier from "~/ui/RequiresRapier";
  import RenderedWorld from "~/ui/RenderedWorld";
  import FrameRateStats from "~/ui/FrameRateStats";
  import Editor from "~/ui/Editor.svelte";
</script>

<RequiresRapier>
  <RenderedWorld />
</RequiresRapier>

<Editor />

<FrameRateStats />
