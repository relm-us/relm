<script lang="ts">
  import LeftPanel, { Header, Pane } from "~/ui/LeftPanel";
  import { hovered, selectedEntities, selectedGroups } from "~/world/selection";

  export let world;
</script>

<style>
</style>

<LeftPanel>
  <Header>Editor</Header>
  <Pane title="Selected">
    {#each [...$selectedEntities] as entityId}
      <div>{entityId}</div>
    {/each}
    {#each [...$selectedGroups] as groupId}
      <div>{groupId}</div>
    {/each}
  </Pane>
  <Pane title="Hovered">
    {#each [...$hovered] as entityId}
      <div>{entityId}</div>
    {/each}
  </Pane>
</LeftPanel>
