<script>
  import LeftPanel, { Header, Pane } from "~/ui/LeftPanel";
  import { hovered, selected } from "~/world/selection";

  export let world;
</script>

<style>
</style>

<LeftPanel>
  <Header>Editor</Header>
  <Pane title="Selected">
    {#each [...$selected] as entityId}
      <div>{entityId}</div>
    {/each}
  </Pane>
  <Pane title="Hovered">
    {#each [...$hovered] as entityId}
      <div>{entityId}</div>
    {/each}
  </Pane>
</LeftPanel>
